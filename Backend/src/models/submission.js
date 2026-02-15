// Update your submission model (submission.js)
import mongoose, {Schema} from "mongoose";

const submissionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },

  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'problem',
    required: true,
  },

  contestId: {  // NEW FIELD - make it optional
    type: Schema.Types.ObjectId,
    ref: 'contest',
    required: false, // This makes it optional
    default: null,   // Default to null for non-contest submissions
  },

  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'c++', 'java', 'python', 'cpp'],
  },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'wrong', 'error'],
    default: 'pending'
  },

  runtime: {
    type: Number,  // milliseconds
    default: 0
  },
  memory: {
    type: Number,  // kB
    default: 0
  },
  errorMessage: {
    type: String,
    default: ''
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  testCasesTotal: {  
    type: Number,
    default: 0
  },
  score: {  // Add score field for contest submissions
    type: Number,
    default: 0
  },
  submittedAt: {  // Explicit timestamp for contest timing
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true
});

// Update indexes
submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ contestId: 1, userId: 1 }); // For contest queries
submissionSchema.index({ contestId: 1, problemId: 1, userId: 1 }); // For specific contest problem queries

const Submission = mongoose.model('submission', submissionSchema);

export default Submission;