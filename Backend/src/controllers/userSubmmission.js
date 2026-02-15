import Problem from "../models/problem.js";
import Submission from "../models/submission.js";
import { getLanguageById, submitBatch, submitToken } from "../utils.js/ProblemUtility.js";

const submitCode = async (req, res) => {
  try {
    const user = req.user; // now coming from middleware
    const userId = user?._id;
    const problemId = req.params.id;
    let { code, language } = req.body;


    // Validation
    if (!userId || !problemId || !code || !language) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Normalize C++
    if (language.toLowerCase() === "cpp") language = "c++";

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Create initial submission record
    const submission = await Submission.create({
      userId,
      problemId,
      code,
      language,
      status: "pending",
      testCasesTotal: problem.hiddenTestCases.length
    });

    // Judge0 mappings
    const languageId = getLanguageById(language);

    const submissionsPayload = problem.hiddenTestCases.map(tc => ({
      source_code: code,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.output
    }));

    // Send to Judge0
    const submitResponse = await submitBatch(submissionsPayload);
    const tokens = submitResponse.map(r => r.token);

    const testResults = await submitToken(tokens);



    let passed = 0;
    let totalRuntime = 0;
    let maxMemory = 0;
    let status = "accepted";
    let errorMessage = null;

    for (const result of testResults) {
      if (result.status.id === 3) { // Accepted
        passed++;
        totalRuntime += Number(result.time ?? 0);
        maxMemory = Math.max(maxMemory, result.memory ?? 0);
      } else {
        status = result.status.id === 4 ? "error" : "wrong";
        errorMessage = result.stderr || result.compile_output || result.message;
      }
    }

    // Update submission result
    submission.status = status;
    submission.testCasesPassed = passed;
    submission.errorMessage = errorMessage;
    submission.runtime = totalRuntime;
    submission.memory = maxMemory;
    await submission.save();

    // Update user's solved list
    // ✅ Update user's solved list safely
    if (!Array.isArray(user.problemSolved)) {
      user.problemSolved = [];
    }

    if (!user.problemSolved.includes(problemId)) {
      user.problemSolved.push(problemId);
      await user.save();
    }




    return res.status(201).json({
      accepted: status === "accepted",
      totalTestCases: submission.testCasesTotal,
      passedTestCases: passed,
      runtime: totalRuntime,
      memory: maxMemory,
      message: status,
      errorMessage
    });

  } catch (err) {
    console.error("Submit Error:", err);
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message
    });
  }
};



const runCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const problemId = req.params.id;

    let { code, language } = req.body;

    if (!userId || !code || !problemId || !language)
      return res.status(400).send("Some field missing");

    const problem = await Problem.findById(problemId)

    if (language === 'cpp')
      language = 'c++'

    const languageId = getLanguageById(language);

    const submission = problem.visibleTestCases.map((testcase) => ({
      source_code: code,
      language_id: languageId,
      stdin: testcase.input,
      expected_output: testcase.output
    }))

    const submitResult = await submitBatch(submission)

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
        runtime = runtime + parseFloat(test.time)
        memory = Math.max(memory, test.memory);
      } else {
        if (test.status_id == 4) {
          status = false
          errorMessage = test.stderr
        }
        else {
          status = false
          errorMessage = test.stderr
        }
      }
    }

    res.status(201).json({
      success: status,
      testCases: testResult,
      runtime,
      memory
    });

  }
  catch (err) {
    res.status(500).send("Internal Server Error " + err);
  }
}

export { submitCode, runCode }