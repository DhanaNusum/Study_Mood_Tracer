const mongoose = require('mongoose');

const studyLogSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  emotions: [{
    emotion: {
      type: String,
      required: true,
      enum: ['Happy', 'Tired', 'Stressed', 'Excited', 'Anxious', 'Focused', 'Bored', 'Confident', 'Frustrated', 'Calm']
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    }
  }],
  study_time: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number,
    min: 1,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

// Index for efficient queries
studyLogSchema.index({ user_id: 1, study_time: -1 });
studyLogSchema.index({ user_id: 1, subject: 1, 'emotions.emotion': 1 });
studyLogSchema.index({ user_id: 1, 'emotions.emotion': 1, 'emotions.score': 1 });

module.exports = mongoose.model('StudyLog', studyLogSchema);
