const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: Number, required: true }, // TMDB movie ID
    title: { type: String, trim: true, maxlength: 120 },
    content: { type: String, required: true, trim: true, maxlength: 10000 },
  },
  { timestamps: true },
);

// One review per user per movie.
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });
reviewSchema.index({ movieId: 1, updatedAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
