const mongoose = require('mongoose');
const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: Number, required: true }, // TMDB movie ID
  status: { type: String, enum: ['Plan to Watch', 'Watching', 'Completed', 'On Hold', 'Dropped'], default: 'Plan to Watch' },
  score: { type: Number, min: 1, max: 10 },
  notes: { type: String, maxlength: 2000 }
}, { timestamps: true });
watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });
module.exports = mongoose.model('WatchlistEntry', watchlistSchema);
