// controllers/contest.js - ENHANCED WITH REAL-TIME FEATURES
import Contest from "../models/contestModel.js";
import Problem from "../models/problem.js";
import Submission from "../models/submission.js";
import mongoose from "mongoose";
import { getLanguageById, submitBatch, submitToken } from "../utils.js/ProblemUtility.js";

// =================== UTILITY FUNCTIONS ===================

// Update contest status based on time
const updateContestStatus = async (contestId) => {
  try {
    const contest = await Contest.findById(contestId);
    if (!contest) return;

    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);

    let newStatus = contest.status;

    if (now < startTime) {
      newStatus = 'upcoming';
    } else if (now >= startTime && now <= endTime) {
      newStatus = 'ongoing';
    } else if (now > endTime) {
      newStatus = 'ended';
    }

    if (newStatus !== contest.status) {
      contest.status = newStatus;
      await contest.save();
      console.log(`Contest ${contestId} status updated to ${newStatus}`);
    }
  } catch (error) {
    console.error('Error updating contest status:', error);
  }
};

// Schedule status updates for all contests
export const scheduleContestStatusUpdates = () => {
  setInterval(async () => {
    try {
      const contests = await Contest.find({
        status: { $in: ['upcoming', 'ongoing'] }
      });

      for (const contest of contests) {
        await updateContestStatus(contest._id);
      }
    } catch (error) {
      console.error('Error in contest status scheduler:', error);
    }
  }, 60000); // Check every minute
};

// Calculate time remaining
const getTimeRemaining = (contest) => {
  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);

  if (now < startTime) {
    // Contest hasn't started
    const diff = startTime - now;
    return {
      type: 'starts_in',
      value: formatTime(diff),
      seconds: Math.floor(diff / 1000)
    };
  } else if (now >= startTime && now <= endTime) {
    // Contest is ongoing
    const diff = endTime - now;
    return {
      type: 'ends_in',
      value: formatTime(diff),
      seconds: Math.floor(diff / 1000)
    };
  } else {
    // Contest has ended
    return {
      type: 'ended',
      value: 'Contest Ended',
      seconds: 0
    };
  }
};

// Format time for display
const formatTime = (milliseconds) => {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Calculate contest progress percentage
const getContestProgress = (contest) => {
  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);

  if (now < startTime) return 0;
  if (now > endTime) return 100;

  const totalDuration = endTime - startTime;
  const elapsed = now - startTime;

  return Math.min(100, Math.floor((elapsed / totalDuration) * 100));
};

// =================== CONTROLLER FUNCTIONS ===================

// Get all contests with enhanced time data
export const getAllContests = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search = "" } = req.query;

    let query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (!req.user?.isAdmin) {
      query.isPublic = true;
    }

    const contests = await Contest.find(query)
      .populate("createdBy", "username firstName lastName profilePic")
      .sort({ startTime: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Enhance with time data
    const enhancedContests = contests.map(contest => {
      const contestObj = contest.toObject();
      const timeRemaining = getTimeRemaining(contest);
      const progress = getContestProgress(contest);
      const isRegistered = contest.participants.some(
        p => p.userId.toString() === req.user?.id
      );

      return {
        ...contestObj,
        timeRemaining,
        progress,
        isRegistered,
        duration: Math.floor((new Date(contest.endTime) - new Date(contest.startTime)) / (1000 * 60 * 60)), // hours
        participantsCount: contest.participants.length,
        problemsCount: contest.problems.length
      };
    });

    const total = await Contest.countDocuments(query);

    res.json({
      success: true,
      contests: enhancedContests,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get single contest with real-time data
export const getContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate("problems.problemId", "title difficulty tags acceptanceRate")
      .populate("createdBy", "username firstName lastName profilePic")
      .populate("participants.userId", "username firstName lastName profilePic");

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: "Contest not found"
      });
    }

    // Update status first
    await updateContestStatus(contest._id);
    await contest.save();

    // Check if user is registered
    let isRegistered = false;
    let userRank = null;
    let userScore = 0;
    let userParticipant = null;

    if (req.user) {
      userParticipant = contest.participants.find(
        p => p.userId.toString() === req.user.id
      );

      if (userParticipant) {
        isRegistered = true;
        userScore = userParticipant.score;

        // Calculate rank based on score and last submission
        const sortedParticipants = [...contest.participants].sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return new Date(a.lastSubmission || 0) - new Date(b.lastSubmission || 0);
        });

        userRank = sortedParticipants.findIndex(
          p => p.userId.toString() === req.user.id
        ) + 1;
      }
    }

    // Get time data
    const timeRemaining = getTimeRemaining(contest);
    const progress = getContestProgress(contest);

    // Calculate contest statistics
    const totalParticipants = contest.participants.length;
    const averageScore = totalParticipants > 0
      ? contest.participants.reduce((sum, p) => sum + p.score, 0) / totalParticipants
      : 0;

    const problemsSolvedStats = contest.problems.map(problem => {
      const solvedCount = contest.participants.filter(p =>
        p.problemsSolved.some(solved =>
          solved.problemId.toString() === problem.problemId.toString()
        )
      ).length;

      return {
        problemId: problem.problemId,
        solvedCount,
        successRate: totalParticipants > 0 ? (solvedCount / totalParticipants) * 100 : 0
      };
    });

    res.json({
      success: true,
      contest: {
        ...contest.toObject(),
        timeRemaining,
        progress,
        totalParticipants,
        averageScore: Math.round(averageScore * 100) / 100,
        problemsSolvedStats
      },
      userStats: {
        isRegistered,
        rank: userRank,
        score: userScore,
        problemsSolved: userParticipant?.problemsSolved?.length || 0,
        participant: userParticipant
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create contest with auto status calculation
export const createContest = async (req, res) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      problems,
      rules,
      prizePool,
      tags,
      difficulty,
      isPublic = true
    } = req.body;

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (end <= start) {
      return res.status(400).json({
        success: false,
        error: "End time must be after start time"
      });
    }

    if (start < now) {
      return res.status(400).json({
        success: false,
        error: "Start time cannot be in the past"
      });
    }

    // Calculate initial status
    let status = 'upcoming';
    if (start <= now && end >= now) {
      status = 'ongoing';
    } else if (end < now) {
      status = 'ended';
    }

    // Validate problems exist
    if (problems && problems.length > 0) {
      const problemIds = problems.map(p => p.problemId);
      const existingProblems = await Problem.find({ _id: { $in: problemIds } });

      if (existingProblems.length !== problemIds.length) {
        return res.status(400).json({
          success: false,
          error: "One or more problems not found"
        });
      }
    }

    const contest = new Contest({
      title,
      description,
      startTime: start,
      endTime: end,
      problems: problems || [],
      rules: rules || [],
      prizePool,
      tags: tags || [],
      difficulty,
      isPublic,
      createdBy: req.user.id,
      status
    });

    await contest.save();

    // Schedule status updates
    setTimeout(() => updateContestStatus(contest._id), Math.max(0, start - now));
    setTimeout(() => updateContestStatus(contest._id), Math.max(0, end - now));

    res.status(201).json({
      success: true,
      message: "Contest created successfully",
      contest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Enhanced register for contest with time validation
export const registerForContest = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: "Contest not found"
      });
    }

    // Update contest status
    await updateContestStatus(contest._id);

    // Check if contest registration is open
    const now = new Date();
    
    // Allow registration until contest ends
    if (contest.status === "ended") {
      return res.status(400).json({
        success: false,
        error: "Contest has already ended"
      });
    }

    // Check if already registered
    const isRegistered = contest.participants.some(
      p => p.userId.toString() === req.user.id
    );

    if (isRegistered) {
      return res.status(400).json({
        success: false,
        error: "Already registered for this contest"
      });
    }

    // Add participant
    contest.participants.push({
      userId: new mongoose.Types.ObjectId(req.user.id),
      score: 0,
      problemsSolved: [],
      lastSubmission: null,
      registeredAt: new Date(),
      lateRegistration: contest.status === "ongoing" // Mark if registered after contest started
    });

    await contest.save();

    res.json({
      success: true,
      message: contest.status === "ongoing" 
        ? "Successfully registered for ongoing contest" 
        : "Successfully registered for contest",
      contestStartTime: contest.startTime,
      contestEndTime: contest.endTime,
      timeRemaining: getTimeRemaining(contest),
      contestStatus: contest.status,
      isLateRegistration: contest.status === "ongoing"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Enhanced contest problem submission with time-based scoring
// export const submitContestCode = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const problemId = req.params.problemId;
//     const contestId = req.params.contestId;
//     let { code, language } = req.body;

//     if (!code || !language) {
//       return res.status(400).json({ message: "Code & Language are required" });
//     }

//     // Normalize language
//     language = language.toLowerCase();
//     if (language === "cpp") language = "c++";

//     // Fetch contest and update status
//     const contest = await Contest.findById(contestId);
//     if (!contest) return res.status(404).json({ message: "Contest not found" });

//     // Update contest status
//     await updateContestStatus(contest._id);

//     // Check contest status
//     if (contest.status !== "ongoing") {
//       return res.status(400).json({
//         message: "Contest is not active",
//         contestStatus: contest.status
//       });
//     }

//     // Check if registered
//     const participantIndex = contest.participants.findIndex(
//       p => p.userId.toString() === userId.toString()
//     );

//     if (participantIndex === -1) {
//       return res.status(403).json({ message: "Not registered for this contest" });
//     }

//     // Find contest problem
//     const contestProblem = contest.problems.find(
//       p => p.problemId.toString() === problemId
//     );

//     if (!contestProblem) {
//       return res.status(404).json({ message: "Problem not found in contest" });
//     }

//     // Fetch problem
//     const problem = await Problem.findById(problemId);
//     if (!problem) return res.status(404).json({ message: "Problem not found" });

//     const hidden = problem.hiddenTestCases || [];
//     if (!hidden.length) {
//       return res.status(400).json({ message: "No hidden testcases present" });
//     }

//     // Check if already solved (for penalty calculation)
//     const participant = contest.participants[participantIndex];
//     const alreadySolved = participant.problemsSolved.some(
//       solved => solved.problemId.toString() === problemId
//     );

//     // Create submission record
//     const submission = await Submission.create({
//       userId,
//       problemId,
//       contestId,
//       code,
//       language,
//       status: "pending",
//       testCasesTotal: hidden.length,
//       submittedAt: new Date()
//     });

//     const languageId = getLanguageById(language);

//     const judgePayload = hidden.map((tc) => ({
//       source_code: code,
//       language_id: languageId,
//       stdin: tc.input,
//       expected_output: tc.output,
//     }));

//     const batch = await submitBatch(judgePayload);
//     const tokens = batch.map((x) => x.token);

//     const results = await submitToken(tokens);

//     let passed = 0;
//     let totalRuntime = 0;
//     let maxMemory = 0;
//     let errorMessage = null;
//     let finalStatus = "wrong";

//     for (const res of results) {
//       const statusId = res?.status?.id;

//       if (statusId === 3) {
//         passed++;
//         totalRuntime += Number(res.time || 0);
//         maxMemory = Math.max(maxMemory, res.memory || 0);
//       } else {
//         errorMessage = res.stderr || res.compile_output || res.message || "Error";
//       }
//     }

//     // Check if all test cases passed
//     if (passed === hidden.length) {
//       finalStatus = "accepted";

//       // Calculate score with time penalty
//       const baseScore = contestProblem.points || 100;
//       const contestStart = new Date(contest.startTime);
//       const solveTime = new Date();
//       const timeTaken = (solveTime - contestStart) / 1000; // in seconds

//       // Penalty for wrong submissions before solving
//       const wrongAttempts = participant.problemsSolved
//         .find(p => p.problemId.toString() === problemId)?.attempts || 0;
//       const penaltyPoints = wrongAttempts * 10; // 10 points per wrong attempt

//       // Time penalty: 1 point per 5 minutes
//       const timePenalty = Math.floor(timeTaken / 300);
//       const finalScore = Math.max(
//         baseScore - timePenalty - penaltyPoints,
//         baseScore * 0.3 // Minimum 30% of base score
//       );

//       // Update participant score
//       contest.participants[participantIndex].score += Math.floor(finalScore);

//       // Update solved problems
//       if (!alreadySolved) {
//         contest.participants[participantIndex].problemsSolved.push({
//           problemId,
//           solvedAt: solveTime,
//           attempts: wrongAttempts + 1,
//           score: Math.floor(finalScore)
//         });
//       } else {
//         // Update attempts count for already solved problem
//         const problemSolved = contest.participants[participantIndex].problemsSolved
//           .find(p => p.problemId.toString() === problemId);
//         if (problemSolved) {
//           problemSolved.attempts += 1;
//         }
//       }

//       contest.participants[participantIndex].lastSubmission = solveTime;

//       // Update leaderboard
//       contest.leaderboard = contest.participants
//         .map(p => ({
//           userId: p.userId,
//           score: p.score,
//           problemsSolved: p.problemsSolved.length,
//           lastSubmission: p.lastSubmission
//         }))
//         .sort((a, b) => {
//           if (b.score !== a.score) return b.score - a.score;
//           if (a.problemsSolved !== b.problemsSolved) return b.problemsSolved - a.problemsSolved;
//           return new Date(a.lastSubmission || 0) - new Date(b.lastSubmission || 0);
//         });

//       await contest.save();
//     }

//     // Update submission
//     submission.status = finalStatus;
//     submission.testCasesPassed = passed;
//     submission.errorMessage = errorMessage;
//     submission.runtime = totalRuntime;
//     submission.memory = maxMemory;
//     submission.executedAt = new Date();
//     await submission.save();

//     return res.status(201).json({
//       accepted: finalStatus === "accepted",
//       totalTestCases: hidden.length,
//       passedTestCases: passed,
//       runtime: totalRuntime,
//       memory: maxMemory,
//       message: finalStatus,
//       errorMessage,
//       score: finalStatus === "accepted" ? Math.floor(finalScore) : 0,
//       rank: participantIndex + 1,
//       isFirstAttempt: wrongAttempts === 0
//     });
//   } catch (err) {
//     console.error("Submit Error:", err);
//     return res.status(500).json({
//       message: "Internal Server Error",
//       error: err.message,
//     });
//   }
// };

// Get contest leaderboard with real-time ranking
export const getContestLeaderboard = async (req, res) => {
  try {
    console.log("=== FETCHING LEADERBOARD ===");
    console.log("Contest ID:", req.params.id);

    // Populate participants.userId, NOT leaderboard.userId
    const contest = await Contest.findById(req.params.id)
      .populate({
        path: 'participants.userId',
        select: 'username firstName lastName profilePic email'
      });

    if (!contest) {
      console.log("Contest not found");
      return res.status(404).json({
        success: false,
        error: "Contest not found"
      });
    }

    console.log("Contest found:", contest.title);
    console.log("Total participants:", contest.participants.length);
    
    // Debug: Check if participants are populated
    if (contest.participants.length > 0) {
      const firstParticipant = contest.participants[0];
      console.log("First participant:", firstParticipant);
      console.log("First participant userId type:", typeof firstParticipant.userId);
      console.log("First participant userId:", firstParticipant.userId);
      
      if (firstParticipant.userId && typeof firstParticipant.userId === 'object') {
        console.log("First participant username:", firstParticipant.userId.username);
      }
    }

    // Build leaderboard with proper user data handling
    const leaderboard = contest.participants
      .filter(p => p.userId) // Filter out participants without userId
      .map(p => {
        const user = p.userId;
        
        // Get user data whether populated or not
        let userData = {};
        
        if (user && typeof user === 'object') {
          // User is populated object
          userData = {
            _id: user._id,
            username: user.firstName || 'unknown',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            profilePic: user.profilePic,
            email: user.email
          };
        } else if (typeof user === 'string') {
          // User is just ObjectId string (not populated properly)
          userData = {
            _id: user,
            username: `user_${user.substring(0, 6)}`,
            firstName: '',
            lastName: '',
            profilePic: null
          };
        } else {
          // Fallback
          userData = {
            _id: p._id || 'unknown',
            username: 'unknown',
            firstName: '',
            lastName: '',
            profilePic: null
          };
        }

        return {
          userId: userData._id,
          user: userData, // Include full user object
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profilePic: userData.profilePic,
          score: p.score || 0,
          problemsSolved: Array.isArray(p.problemsSolved) ? p.problemsSolved.length : 0,
          lastSubmission: p.lastSubmission || null,
          rank: 0 // Will be set after sorting
        };
      })
      .sort((a, b) => {
        // Sort by score (descending)
        if (b.score !== a.score) return b.score - a.score;
        // Then by problems solved (descending)
        if (b.problemsSolved !== a.problemsSolved) return b.problemsSolved - a.problemsSolved;
        // Then by last submission time (ascending - earlier is better)
        return new Date(a.lastSubmission || 0) - new Date(b.lastSubmission || 0);
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        progress: contest.problems.length > 0
          ? Math.round((item.problemsSolved / contest.problems.length) * 100)
          : 0
      }));

    console.log("Leaderboard entries:", leaderboard.length);
    if (leaderboard.length > 0) {
      console.log("First leaderboard entry:", leaderboard[0]);
    }

    res.json({
      success: true,
      leaderboard,
      totalParticipants: contest.participants.length,
      contestStatus: contest.status,
      contestEndTime: contest.endTime,
      contestTitle: contest.title
    });
  } catch (error) {
    console.error("Error in getContestLeaderboard:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get contest submissions with pagination
export const getContestSubmissions = async (req, res) => {
  try {
    const { contestId, problemId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    console.log("=== GET CONTEST SUBMISSIONS ===");
    console.log("Contest ID:", contestId);
    console.log("Problem ID:", problemId);
    console.log("User ID:", userId);

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(contestId) || !mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid contest or problem ID format"
      });
    }

    // Build query
    const query = { 
      userId: new mongoose.Types.ObjectId(userId),
      problemId: new mongoose.Types.ObjectId(problemId)
    };

    // For contest submissions, we need contestId to match
    // For backward compatibility, also check for null contestId
    query.$or = [
      { contestId: new mongoose.Types.ObjectId(contestId) },
      { contestId: null }
    ];

    console.log("Query:", JSON.stringify(query));

    // Remove populate for contestId since we don't need contest details here
    const submissions = await Submission.find(query)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('problemId', 'title difficulty') // Only populate problem
      .lean();

    console.log("Found submissions:", submissions.length);

    const formattedSubmissions = submissions.map(sub => ({
      _id: sub._id,
      code: sub.code,
      language: sub.language,
      status: sub.status,
      testCasesPassed: sub.testCasesPassed || 0,
      testCasesTotal: sub.testCasesTotal || 0,
      runtime: sub.runtime || 0,
      memory: sub.memory || 0,
      score: sub.score || 0,
      errorMessage: sub.errorMessage,
      submittedAt: sub.submittedAt,
      executedAt: sub.updatedAt,
      problem: sub.problemId ? {
        _id: sub.problemId._id,
        title: sub.problemId.title,
        difficulty: sub.problemId.difficulty
      } : null,
      // We don't need contest info in the response for now
    }));

    const total = await Submission.countDocuments(query);

    res.json({
      success: true,
      submissions: formattedSubmissions,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error("Error fetching contest submissions:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getContestParticipants = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate("participants.userId", "username firstName lastName profilePic");

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: "Contest not found"
      });
    }

    res.json({
      success: true,
      participants: contest.participants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getContestStats = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: "Contest not found"
      });
    }

    console.log("Contest ID:", contest._id);
    console.log("Total participants:", contest.participants?.length || 0);
    console.log("Total problems:", contest.problems?.length || 0);

    // Safely calculate stats
    const participants = contest.participants || [];
    const problems = contest.problems || [];
    
    // Calculate total submissions
    const totalSubmissions = await Submission.countDocuments({ contestId: contest._id });
    console.log("Total submissions:", totalSubmissions);
    
    // Calculate average score safely
    let totalScore = 0;
    let participantCount = 0;
    let maxScore = 0;
    
    participants.forEach(p => {
      const score = p.score || 0;
      totalScore += score;
      participantCount++;
      if (score > maxScore) maxScore = score;
    });
    
    const averageScore = participantCount > 0 ? totalScore / participantCount : 0;
    
    console.log("Average score:", averageScore, "Max score:", maxScore);

    // Calculate problem stats safely
    const problemsStats = await Promise.all(
      problems.map(async (p) => {
        try {
          // Get problem ID - could be nested or direct
          const problemId = p.problemId?._id || p.problemId || p._id;
          const points = p.points || 100;
          
          if (!problemId) {
            return {
              problemId: null,
              points,
              solvedCount: 0,
              successRate: 0
            };
          }
          
          // Count how many participants solved this problem
          let solvedCount = 0;
          
          participants.forEach(participant => {
            const problemsSolved = participant.problemsSolved || [];
            
            // Check if this participant solved the problem
            const hasSolved = problemsSolved.some(solved => {
              const solvedId = solved.problemId?._id || solved.problemId || solved;
              return solvedId && solvedId.toString() === problemId.toString();
            });
            
            if (hasSolved) solvedCount++;
          });
          
          const successRate = participants.length > 0 
            ? (solvedCount / participants.length) * 100 
            : 0;
          
          return {
            problemId,
            points,
            solvedCount,
            successRate: parseFloat(successRate.toFixed(2))
          };
          
        } catch (err) {
          console.error("Error calculating problem stats:", err);
          return {
            problemId: p.problemId?._id || p.problemId || p._id,
            points: p.points || 100,
            solvedCount: 0,
            successRate: 0
          };
        }
      })
    );

    // Additional stats
    const totalAttempts = participants.reduce((sum, p) => {
      const problemsSolved = p.problemsSolved || [];
      return sum + problemsSolved.reduce((attemptSum, solved) => 
        attemptSum + (solved.attempts || 1), 0
      );
    }, 0);

    const stats = {
      totalParticipants: participants.length,
      totalProblems: problems.length,
      totalSubmissions,
      totalAttempts,
      averageScore: parseFloat(averageScore.toFixed(2)),
      maxScore,
      problemsStats,
      accuracyRate: totalSubmissions > 0 
        ? parseFloat(((problemsStats.reduce((sum, p) => sum + p.solvedCount, 0) / totalSubmissions) * 100).toFixed(2))
        : 0,
      averageSolveTime: 0, // Would need additional data
      topPerformers: participants
        .sort((a, b) => (b.score || 0) - (a.score || 0))
        .slice(0, 3)
        .map(p => ({
          userId: p.userId,
          score: p.score || 0,
          problemsSolved: p.problemsSolved?.length || 0
        }))
    };

    console.log("Final stats:", {
      totalParticipants: stats.totalParticipants,
      totalProblems: stats.totalProblems,
      averageScore: stats.averageScore,
      accuracyRate: stats.accuracyRate
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Error in getContestStats:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// Get specific contest problem
export const getContestProblem = async (req, res) => {
  try {
    const { contestId, problemId } = req.params;

    const contest = await Contest.findById(contestId)
      .populate({
        path: 'problems.problemId',
        select: 'title description difficulty tags testCases examples constraints visibleTestCases' // Added testCases
      });

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: "Contest not found"
      });
    }

    const contestProblem = contest.problems.find(p =>
      p.problemId._id.toString() === problemId ||
      p.problemId.toString() === problemId
    );

    if (!contestProblem) {
      return res.status(404).json({
        success: false,
        error: "Problem not found in contest"
      });
    }

    const isRegistered = contest.participants.some(
      p => p.userId.toString() === req.user.id
    );

    const canAccess = contest.status === "ended" || isRegistered || req.user?.isAdmin;

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: "Register for contest to view problems"
      });
    }

    // Get the problem
    const problem = contestProblem.problemId.toObject();

    // Check what fields are available
    console.log('Problem fields:', Object.keys(problem));
    console.log('testCases exists?', 'testCases' in problem);
    console.log('visibleTestCases exists?', 'visibleTestCases' in problem);

    // Try to get examples from visibleTestCases first
    if (problem.visibleTestCases && problem.visibleTestCases.length > 0) {
      problem.visibleTestCases = problem.visibleTestCases;
    }
    // If not, try testCases with sample flag
    else if (problem.testCases && problem.testCases.length > 0) {
      problem.visibleTestCases = problem.testCases
        .filter(tc => tc.sample === true)
        .map(tc => ({
          input: tc.input,
          output: tc.expectedOutput || tc.output,
          explanation: tc.explanation || null
        }));
    }
    // If neither exists, set empty array
    else {
      problem.visibleTestCases = [];
    }

    // Add contest points
    problem.points = contestProblem.points || 100;

    res.json({
      success: true,
      problem: problem
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Run contest code (without submission)
// const runContestCode = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const problemId = req.params.problemId;


//     let { code, language } = req.body;


//     if (!userId || !code || !problemId || !language)
//       return res.status(400).send("Some field missing");

//     // Check if contest exists
//     const contest = await Contest.findById(req.params.contestId);
//     if (!contest) return res.status(404).send("Contest not found");

//     const problem = await Problem.findById(problemId)

//     if (language === 'cpp')
//       language = 'c++'

//     const languageId = getLanguageById(language);

//     const submission = problem.visibleTestCases.map((testcase) => ({
//       source_code: code,
//       language_id: languageId,
//       stdin: testcase.input,
//       expected_output: testcase.output
//     }))

//     const submitResult = await submitBatch(submission)

//     const resultToken = submitResult.map((value) => value.token);

//     const testResult = await submitToken(resultToken);

//     let testCasesPassed = 0;
//     let runtime = 0;
//     let memory = 0;
//     let status = true;
//     let errorMessage = null;

//     for (const test of testResult) {
//       if (test.status_id == 3) {
//         testCasesPassed++;
//         runtime = runtime + parseFloat(test.time)
//         memory = Math.max(memory, test.memory);
//       } else {
//         if (test.status_id == 4) {
//           status = false
//           errorMessage = test.stderr
//         }
//         else {
//           status = false
//           errorMessage = test.stderr
//         }
//       }
//     }

//     res.status(201).json({
//       success: status,
//       testCases: testResult,
//       runtime,
//       memory
//     });

//   }
//   catch (err) {
//     res.status(500).send("Internal Server Error " + err);
//   }
// }

// Get contest problems
export const getContestProblems = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate("problems.problemId", "title description difficulty tags testCases constraints examples acceptanceRate submissionsCount");

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: "Contest not found"
      });
    }

    // Get user registration status
    let isRegistered = false;
    let userSolvedProblems = [];

    if (req.user) {
      isRegistered = contest.participants.some(
        p => p.userId.toString() === req.user.id
      );

      if (isRegistered) {
        const participant = contest.participants.find(
          p => p.userId.toString() === req.user.id
        );
        userSolvedProblems = participant?.problemsSolved?.map(p => p.problemId.toString()) || [];
      }
    }

    // Check access permissions
    const canAccess = (
      contest.status === "ended" || // Anyone can see ended contests
      (req.user && isRegistered) || // Registered users for ongoing/upcoming
      req.user?.isAdmin // Admins can always see
    );

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        error: "Access denied. You must register for the contest to view problems."
      });
    }

    // Add user-specific data to problems
    const enhancedProblems = contest.problems.map(problem => {
      const problemObj = problem.toObject ? problem.toObject() : problem;
      const problemIdStr = problem.problemId?._id?.toString() || problem.problemId?.toString();

      return {
        ...problemObj,
        isSolved: userSolvedProblems.includes(problemIdStr),
        canView: canAccess,
        problemDetails: problem.problemId
      };
    });

    // Sort problems by order if specified
    const sortedProblems = enhancedProblems.sort((a, b) => {
      if (a.order && b.order) return a.order - b.order;
      if (a.order) return -1;
      if (b.order) return 1;
      return 0;
    });

    res.json({
      success: true,
      problems: sortedProblems,
      contest: {
        id: contest._id,
        title: contest.title,
        status: contest.status,
        startTime: contest.startTime,
        endTime: contest.endTime,
        isRegistered,
        userSolvedCount: userSolvedProblems.length,
        totalProblems: contest.problems.length
      },
      userStats: {
        isRegistered,
        solvedCount: userSolvedProblems.length,
        totalProblems: contest.problems.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user's contests
export const getMyContests = async (req, res) => {
  try {
    const contests = await Contest.find({
      "participants.userId": req.user.id
    })
      .populate("createdBy", "username firstName lastName profilePic")
      .sort({ startTime: -1 });

    res.json({
      success: true,
      contests
    });
  } catch (error) {
    console.error("Error in getMyContests:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update contest
export const updateContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: "Contest not found"
      });
    }

    // Update contest status based on new times
    await updateContestStatus(contest._id);

    res.json({
      success: true,
      message: "Contest updated successfully",
      contest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Delete contest
export const deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: "Contest not found"
      });
    }

    // Also delete submissions related to this contest
    await Submission.deleteMany({ contestId: req.params.id });

    res.json({
      success: true,
      message: "Contest deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Run contest code (without submission) - EXPORT IT
export const runContestCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const problemId = req.params.problemId;

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).json({
        success: false,
        message: "Some field missing"
      });

    // Check if contest exists
    const contest = await Contest.findById(req.params.contestId);
    if (!contest) return res.status(404).json({
      success: false,
      message: "Contest not found"
    });

    // Check if user is registered
    const isRegistered = contest.participants.some(
      p => p.userId.toString() === userId.toString()
    );

    if (!isRegistered && !req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not registered for this contest"
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({
      success: false,
      message: "Problem not found"
    });

    console.log('Problem fields:', Object.keys(problem.toObject()));
    console.log('visibleTestCases exists?', !!problem.visibleTestCases);
    console.log('testCases exists?', !!problem.testCases);

    if (language === 'cpp')
      language = 'c++'

    const languageId = getLanguageById(language);

    // Use visible test cases or sample test cases
    let testCases = [];
    
    if (problem.visibleTestCases && Array.isArray(problem.visibleTestCases) && problem.visibleTestCases.length > 0) {
      testCases = problem.visibleTestCases;
      console.log('Using visibleTestCases:', testCases.length);
    } else if (problem.testCases && Array.isArray(problem.testCases)) {
      // Filter for sample test cases
      testCases = problem.testCases.filter(tc => tc.sample === true).slice(0, 3);
      console.log('Using testCases (sample):', testCases.length);
    } else {
      console.log('No test cases found');
      return res.status(400).json({
        success: false,
        message: "No test cases available for this problem"
      });
    }

    if (!testCases.length) {
      return res.status(400).json({
        success: false,
        message: "No test cases available for this problem"
      });
    }

    console.log('Final test cases to run:', testCases.length);

    const submission = testCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input || '',
      expected_output: testcase.output || ''
    }));

    const submitResult = await submitBatch(submission);
    const resultToken = submitResult.map((value) => value.token);
    const testResult = await submitToken(resultToken);

    let testCasesPassed = 0;
    let runtime = 0;
    let memory = 0;
    let status = true;
    let errorMessage = null;

    for (const test of testResult) {
      if (test.status_id == 3) {
        testCasesPassed++;
        runtime = runtime + parseFloat(test.time || 0);
        memory = Math.max(memory, test.memory || 0);
      } else {
        status = false;
        errorMessage = test.stderr || test.compile_output || test.message;
        break; // Stop on first failure for run
      }
    }

    res.status(201).json({
      success: status,
      testCases: testResult,
      runtime: runtime.toFixed(3),
      memory,
      passed: testCasesPassed,
      total: testCases.length
    });

  } catch (err) {
    console.error("Run error:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: err.message
    });
  }
};

// Submit contest code - EXPORT IT
export const submitContestCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const { problemId, contestId } = req.params;
    let { code, language } = req.body;

    console.log("=== SUBMIT REQUEST ===");
    console.log("User ID:", userId);
    console.log("Contest ID:", contestId);
    console.log("Problem ID:", problemId);
    console.log("Language:", language);

    // Validate input
    if (!code?.trim() || !language?.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Code & Language are required" 
      });
    }

    // Normalize language
    language = language.toLowerCase();
    if (language === "cpp") language = "c++";
    
    // Validate ObjectIds using imported mongoose
    if (!mongoose.Types.ObjectId.isValid(contestId) || !mongoose.Types.ObjectId.isValid(problemId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    // Fetch contest
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ 
        success: false,
        message: "Contest not found" 
      });
    }
    
    console.log("Contest found:", contest.title);
    
    // Update contest status
    await updateContestStatus(contest._id);
    
    // Check contest status
    if (contest.status !== "ongoing") {
      return res.status(400).json({
        success: false,
        message: "Contest is not active",
        contestStatus: contest.status
      });
    }
    
    // Find participant
    const userIdStr = userId.toString();
    const participant = contest.participants.find(
      p => p.userId.toString() === userIdStr
    );
    
    if (!participant) {
      return res.status(403).json({ 
        success: false,
        message: "Not registered for this contest" 
      });
    }
    
    console.log("Participant found");
    
    // Find contest problem
    const problemIdStr = problemId.toString();
    const contestProblem = contest.problems.find(
      p => p.problemId.toString() === problemIdStr
    );
    
    if (!contestProblem) {
      return res.status(404).json({ 
        success: false,
        message: "Problem not found in contest" 
      });
    }
    
    console.log("Contest problem found");
    
    // Fetch problem
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ 
        success: false,
        message: "Problem not found" 
      });
    }

    // FIXED: Check if hiddenTestCases exists and is an array
    const hidden = Array.isArray(problem.hiddenTestCases) ? problem.hiddenTestCases : [];
    console.log(`Hidden test cases: ${hidden.length}`);
    console.log("Problem has hiddenTestCases field?", "hiddenTestCases" in problem);
    console.log("Type of hiddenTestCases:", typeof problem.hiddenTestCases);
    console.log("Is array?", Array.isArray(problem.hiddenTestCases));
    
    if (hidden.length === 0) {
      // Also check for regular testCases if hiddenTestCases is empty
      const allTestCases = Array.isArray(problem.testCases) ? problem.testCases : [];
      if (allTestCases.length === 0) {
        return res.status(400).json({ 
          success: false,
          message: "No test cases available for this problem" 
        });
      }
      
      // Use all test cases if no hidden ones
      const hidden = allTestCases;
      console.log(`Using all ${hidden.length} test cases`);
    }

    console.log(`Found ${hidden.length} test cases to run`);
    
    // Check if already solved and get attempt count
    const existingProblem = participant.problemsSolved.find(
      p => p.problemId.toString() === problemIdStr
    );
    const alreadySolved = !!existingProblem;
    const wrongAttempts = existingProblem?.attempts || 0;
    
    console.log("Already solved:", alreadySolved, "Attempts:", wrongAttempts);
    
    // Create submission record
    const submission = await Submission.create({
      userId,
      problemId,
      contestId,
      code,
      language,
      status: "pending",
      testCasesTotal: hidden.length,
      submittedAt: new Date()
    });

    console.log("Submission created:", submission._id);

    // Get language ID
    const languageId = getLanguageById(language);
    if (!languageId) {
      return res.status(400).json({
        success: false,
        message: `Unsupported language: ${language}`
      });
    }

    console.log("Language ID:", languageId, "for language:", language);
    
    // FIXED: Add null check for test case properties
    const judgePayload = hidden.map((tc, index) => ({
      source_code: code,
      language_id: languageId,
      stdin: tc?.input || "",
      expected_output: tc?.output || "",
      test_case_index: index
    }));

    console.log("Sending to Judge0...");
    console.log("Payload size:", judgePayload.length);
    
    // Add timeout for Judge0
    const judgeTimeout = 30000; // 30 seconds
    
    const batchPromise = submitBatch(judgePayload);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Judge0 timeout')), judgeTimeout);
    });
    
    const batch = await Promise.race([batchPromise, timeoutPromise]);
    const tokens = batch.map((x) => x.token);

    console.log("Got tokens:", tokens);
    
    // Wait for results with polling
    const results = await submitToken(tokens);
    console.log("Got results from Judge0");

    // Process results
    let passed = 0;
    let totalRuntime = 0;
    let maxMemory = 0;
    let errorMessage = null;
    let finalStatus = "wrong";
    let score = 0;

    for (const result of results) {
      const statusId = result?.status?.id;
      console.log("Test result status:", statusId, result?.status?.description);

      if (statusId === 3) { // Accepted
        passed++;
        totalRuntime += Number(result.time || 0);
        maxMemory = Math.max(maxMemory, result.memory || 0);
      } else {
        errorMessage = result.stderr || result.compile_output || result.message || "Error";
        console.log("Test failed with error:", errorMessage?.substring(0, 200));
        break; // Stop on first failure
      }
    }

    // Calculate results
    const isAccepted = passed === hidden.length;
    console.log(`Passed ${passed}/${hidden.length}, Accepted: ${isAccepted}`);
    
    if (isAccepted) {
      finalStatus = "accepted";
      
      // Calculate score
      const baseScore = contestProblem.points || 100;
      const contestStart = new Date(contest.startTime);
      const solveTime = new Date();
      const timeTaken = (solveTime - contestStart) / 1000;
      
      const penaltyPoints = wrongAttempts * 10; // 10 points per wrong attempt
      const timePenalty = Math.floor(timeTaken / 300); // 1 point per 5 minutes
      const calculatedScore = Math.max(
        baseScore - timePenalty - penaltyPoints,
        baseScore * 0.3 // Minimum 30% of base score
      );
      
      score = Math.floor(calculatedScore);
      
      console.log(`Score calculation: base=${baseScore}, timePenalty=${timePenalty}, wrongAttempts=${wrongAttempts}, penaltyPoints=${penaltyPoints}, final=${score}`);
      
      // Update participant score
      participant.score = (participant.score || 0) + score;
      
      // Update solved problems
      if (!alreadySolved) {
        participant.problemsSolved.push({
          problemId,
          solvedAt: solveTime,
          attempts: wrongAttempts + 1,
          score
        });
      } else {
        // Update attempts count for already solved problem
        if (existingProblem) {
          existingProblem.attempts += 1;
        }
      }
      
      participant.lastSubmission = solveTime;
      
      // Update leaderboard
      contest.participants.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.problemsSolved.length !== a.problemsSolved.length) {
          return b.problemsSolved.length - a.problemsSolved.length;
        }
        return new Date(a.lastSubmission || 0) - new Date(b.lastSubmission || 0);
      });
      
      // Update leaderboard array
      contest.leaderboard = contest.participants.map(p => ({
        userId: p.userId,
        username: p.username || `User_${p.userId.toString().substring(0, 6)}`,
        score: p.score || 0,
        problemsSolved: p.problemsSolved?.length || 0,
        lastSubmission: p.lastSubmission
      }));
      
      await contest.save();
      console.log("Contest saved with updated leaderboard");
    }

    // Update submission
    submission.status = finalStatus;
    submission.testCasesPassed = passed;
    submission.errorMessage = errorMessage;
    submission.runtime = totalRuntime;
    submission.memory = maxMemory;
    submission.executedAt = new Date();
    await submission.save();

    console.log("Submission updated:", submission._id);

    // Find user's rank
    const userRank = contest.leaderboard.findIndex(
      entry => entry.userId.toString() === userIdStr
    ) + 1;

    return res.status(201).json({
      success: true,
      accepted: isAccepted,
      totalTestCases: hidden.length,
      passedTestCases: passed,
      runtime: totalRuntime,
      memory: maxMemory,
      message: finalStatus,
      errorMessage,
      score: isAccepted ? score : 0,
      rank: userRank,
      isFirstAttempt: wrongAttempts === 0,
      submissionId: submission._id
    });
    
  } catch (err) {
    console.error("=== SUBMIT ERROR ===");
    console.error("Error:", err.message);
    console.error("Stack:", err.stack);
    
    // Check for specific errors
    if (err.message.includes('Judge0')) {
      return res.status(502).json({
        success: false,
        message: "Code execution service unavailable",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: err.message,
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// Initialize contest scheduler when server starts
scheduleContestStatusUpdates();



// ... [Keep your other existing functions like getContestProblem, runContestCode, etc.]

// Initialize contest scheduler when server starts
scheduleContestStatusUpdates();