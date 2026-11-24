const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: Number, required: true }, // TMDB movie ID
  title: { type: String, maxlength: 120 },
  content: { type: String, required: true, maxlength: 10000 }
}, { timestamps: true });
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });
module.exports = mongoose.model('Review', reviewSchema);
