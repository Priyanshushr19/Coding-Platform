import mongoose,{Schema} from "mongoose"

const contestSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'ended'],
    default: 'upcoming'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  problems: [{
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'problem'
    },
    points: {
      type: Number,
      default: 100
    },
    order: {
      type: Number
    }
  }],
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    score: {
      type: Number,
      default: 0
    },
    problemsSolved: [{
      problemId: mongoose.Schema.Types.ObjectId,
      solvedAt: Date,
      attempts: {
        type: Number,
        default: 0
      }
    }],
    rank: Number,
    lastSubmission: Date
  }],
  leaderboard: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    score: Number,
    timeTaken: Number, // in seconds
    problemsSolved: Number
  }],
  rules: [{
    type: String
  }],
  prizePool: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  }
}, {
  timestamps: true
});

const Contest= mongoose.model('Contest', contestSchema);
export default Contest