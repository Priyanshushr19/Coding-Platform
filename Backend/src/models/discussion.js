import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "problem",
      required: true, // required added
    },

    tags: [String],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    replies: [
      {
        content: {
          type: String,
          required: true,
        },

        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },

        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
          },
        ],

        dislikes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
          },
        ],

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    isSolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Discussion", discussionSchema);
