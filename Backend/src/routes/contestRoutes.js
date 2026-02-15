// import express from "express";
// import userMiddleware from "../middleware/userMiddleware.js";
// import adminMiddleware from "../middleware/adminMiddleware.js";
// import {
//   getAllContests,
//   getContest,
//   createContest,
//   updateContest,
//   deleteContest,
//   registerForContest,
//   getContestProblems,
//   submitContestProblem,
//   getContestLeaderboard,
//   getContestSubmissions,
//   getMyContests,
//   startContest,
//   getContestParticipants,
//   addProblemToContest,
//   removeProblemFromContest,
//   updateContestProblem,
//   getContestStats,
//   getContestProblem,
//   runContestCode,
//   submitContestCode
// } from "../controllers/contest.js";

// const contestRouter = express.Router();

// // Public routes
// contestRouter.get("/", getAllContests);
// contestRouter.get("/:id", getContest);
// contestRouter.get("/:id/problems",userMiddleware, getContestProblems);
// contestRouter.get("/:id/leaderboard", getContestLeaderboard);
// contestRouter.get("/:id/participants", getContestParticipants);
// contestRouter.get("/:id/stats", getContestStats);

// // User protected routes
// contestRouter.post("/:id/register", userMiddleware, registerForContest);
// contestRouter.post("/:id/problems/:problemId/submit", userMiddleware, submitContestProblem);
// contestRouter.get("/:contestId/:problemId/submissions", userMiddleware, getContestSubmissions);
// contestRouter.post("/:id/start", userMiddleware, startContest);
// contestRouter.get("/:contestId/problems/:problemId", userMiddleware, getContestProblem);
// contestRouter.post("/:contestId/problems/:problemId/run", userMiddleware, runContestCode);
// contestRouter.post("/submit/:contestId/problems/:problemId/submit", userMiddleware, submitContestCode);
// // contestRouter.post("/submit/:contestId/problems/:problemId/submit", submitContestCode);


// // Admin protected routes
// contestRouter.post("/", userMiddleware, adminMiddleware, createContest);
// contestRouter.put("/:id", userMiddleware, adminMiddleware, updateContest);
// contestRouter.delete("/:id", userMiddleware, adminMiddleware, deleteContest);
// contestRouter.post("/:id/problems", userMiddleware, adminMiddleware, addProblemToContest);
// contestRouter.put("/:id/problems/:problemId", userMiddleware, adminMiddleware, updateContestProblem);
// contestRouter.delete("/:id/problems/:problemId", userMiddleware, adminMiddleware, removeProblemFromContest);

// export default contestRouter;
// routes/contestRoutes.js - FIXED VERSION
import express from "express";
import userMiddleware from "../middleware/userMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  getAllContests,
  getContest,
  createContest,
  updateContest,
  deleteContest,
  registerForContest,
  getContestProblems,
  getContestLeaderboard,
  getContestSubmissions,
  getMyContests,
  getContestParticipants,
  getContestStats,
  getContestProblem,
  runContestCode,
  submitContestCode
} from "../controllers/contest.js";

const contestRouter = express.Router();

// Public routes
contestRouter.get("/", getAllContests);
contestRouter.get("/:id", getContest);
contestRouter.get("/:id/leaderboard", getContestLeaderboard);
contestRouter.get("/:id/participants", getContestParticipants);
contestRouter.get("/:id/stats", getContestStats);

// User protected routes
contestRouter.get("/:id/problems", userMiddleware, getContestProblems);
contestRouter.post("/:id/register", userMiddleware, registerForContest);
contestRouter.get("/:contestId/problems/:problemId", userMiddleware, getContestProblem);
contestRouter.post("/:contestId/problems/:problemId/run", userMiddleware, runContestCode);
contestRouter.post("/submit/:contestId/problems/:problemId/submit", userMiddleware, submitContestCode);
// contestRouter.get("/:contestId/:problemId/submissions", userMiddleware, getContestSubmissions);
contestRouter.get("/:contestId/problems/:problemId/submissions", userMiddleware, getContestSubmissions);
contestRouter.get("/user/my-contests", userMiddleware, getMyContests);

// Admin protected routes
contestRouter.post("/", userMiddleware, adminMiddleware, createContest);
contestRouter.put("/:id", userMiddleware, adminMiddleware, updateContest);
contestRouter.delete("/:id", userMiddleware, adminMiddleware, deleteContest);

export default contestRouter;