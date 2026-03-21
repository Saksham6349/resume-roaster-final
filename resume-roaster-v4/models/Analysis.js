const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, default: 'Pasted Text' },
  ats_score: Number,
  categories: Object,
  roast: String,
  fixes: [String],
  strengths: [String],
  jd_match: { type: Object, default: null },
  ai_steps: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analysis', analysisSchema);
