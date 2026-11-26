const mongoose = require("mongoose");

const STATUSES = ["Plan to Watch", "Watching", "Completed", "On Hold", "Dropped"];

const watchlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    movieId: { type: Number, required: true }, // TMDB movie ID

    // Cached from TMDB so lists can be shown without one API call per movie.
    title: { type: String, default: "Untitled movie" },
    posterPath: { type: String, default: null },
    releaseDate: { type: String, default: null },

    status: { type: String, enum: STATUSES, default: "Plan to Watch" },
    score: {
      type: Number,
      min: 1,
      max: 10,
      validate: { validator: Number.isInteger, message: "Score must be a whole number." },
    },
    notes: { type: String, maxlength: 2000 },
  },
  { timestamps: true },
);

watchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const WatchlistEntry = mongoose.model("WatchlistEntry", watchlistSchema);
WatchlistEntry.STATUSES = STATUSES;

module.exports = WatchlistEntry;
