import Discussion from "../models/discussion.js";

// Get all discussions (optional)
export const getDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate('author', 'firstName profilePic')
      .populate('replies.author', 'firstName profilePic')
      .sort({ createdAt: -1 });
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get discussions for a specific problem
export const getProblemDiscussions = async (req, res) => {
  try {
    const { problemId } = req.params;
    const discussions = await Discussion.find({ problemId })
      .populate('author', 'firstName profilePic')
      .populate('replies.author', 'firstName profilePic')
      .sort({ createdAt: -1 });
    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new discussion for a problem
export const createDiscussion = async (req, res) => {
  try {
    
    const discussion = new Discussion({
      ...req.body,
      author: req.user.id
    });
    
    await discussion.save();
    await discussion.populate('author', 'firstName profilePic');
    
    res.status(201).json(discussion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ... rest of the controller functions remain the same
export const addReply = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    discussion.replies.push({
      content: req.body.content,
      author: req.user.id
    });

    await discussion.save();
    await discussion.populate('replies.author', 'firstName profilePic');
    res.json(discussion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const likeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    const userId = req.user.id;
    const hasLiked = discussion.likes.includes(userId);
    const hasDisliked = discussion.dislikes.includes(userId);

    if (hasLiked) {
      discussion.likes.pull(userId);
    } else {
      discussion.likes.push(userId);
      if (hasDisliked) discussion.dislikes.pull(userId);
    }

    await discussion.save();
    res.json(discussion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const dislikeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    const userId = req.user.id;
    const hasLiked = discussion.likes.includes(userId);
    const hasDisliked = discussion.dislikes.includes(userId);

    if (hasDisliked) {
      discussion.dislikes.pull(userId);
    } else {
      discussion.dislikes.push(userId);
      if (hasLiked) discussion.likes.pull(userId);
    }

    await discussion.save();
    res.json(discussion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const likeReply = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.discussionId);
    const reply = discussion.replies.id(req.params.replyId);
    const userId = req.user.id;

    const hasLiked = reply.likes.includes(userId);
    const hasDisliked = reply.dislikes.includes(userId);

    if (hasLiked) {
      reply.likes.pull(userId);
    } else {
      reply.likes.push(userId);
      if (hasDisliked) reply.dislikes.pull(userId);
    }

    await discussion.save();
    res.json(discussion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
