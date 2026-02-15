import express from "express";
import userMiddleware from "../middleware/userMiddleware.js";
import {
  getDiscussions,
  getProblemDiscussions,
  createDiscussion,
  addReply,
  likeDiscussion,
  dislikeDiscussion,
  likeReply
} from "../controllers/discussion.js";

const discussionRouter = express.Router();

// Get all discussions (optional)
discussionRouter.get("/", getDiscussions);

// Get discussions for a specific problem
discussionRouter.get("/problem/:problemId", getProblemDiscussions);

// Create new discussion for a problem
discussionRouter.post("/", userMiddleware, createDiscussion);

// Add reply to discussion
discussionRouter.post("/:id/reply", userMiddleware, addReply);

// Like/Dislike discussion
discussionRouter.post("/:id/like", userMiddleware, likeDiscussion);
discussionRouter.post("/:id/dislike", userMiddleware, dislikeDiscussion);

// Like reply
discussionRouter.post("/:discussionId/reply/:replyId/like", userMiddleware, likeReply);

export default discussionRouter;