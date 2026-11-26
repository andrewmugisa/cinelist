const mongoose = require("mongoose");

// Cached copy of the TMDB fields needed to show a favourite on the profile.
const favoriteMovieSchema = new mongoose.Schema(
  {
    movieId: { type: Number, required: true },
    title: { type: String, required: true },
    posterPath: { type: String, default: null },
    releaseDate: { type: String, default: null },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: { type: String, required: true },
    favoriteMovies: {
      type: [favoriteMovieSchema],
      default: [],
      validate: {
        validator: (list) => list.length <= 10,
        message: "You can have at most 10 favourite movies.",
      },
    },
    lastSeenAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
