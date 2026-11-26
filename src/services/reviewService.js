const Review = require("../models/Review");

async function getMovieReviews(movieId) {
  const reviews = await Review.find({ movieId })
    .sort({ updatedAt: -1 })
    .populate("userId", "username")
    .lean();

  // Skip reviews whose author account was deleted.
  return reviews.filter((review) => review.userId);
}

function getUserReview(userId, movieId) {
  return Review.findOne({ userId, movieId }).lean();
}

// Creates the user's review for a movie, or replaces it if one exists.
function saveReview(userId, movieId, { title, content }) {
  const update = { $set: { content } };
  if (title) update.$set.title = title;
  else update.$unset = { title: "" };

  return Review.findOneAndUpdate({ userId, movieId }, update, {
    returnDocument: "after",
    upsert: true,
    runValidators: true,
  }).lean();
}

async function deleteReview(userId, movieId) {
  const result = await Review.deleteOne({ userId, movieId });
  return result.deletedCount > 0;
}

// Shape used by the views.
function toReviewItem(review, currentUserId) {
  const author = review.userId;
  return {
    id: review._id.toString(),
    movieId: review.movieId,
    title: review.title || "",
    content: review.content,
    username: author.username,
    profilePath: `/user/${encodeURIComponent(author.username)}`,
    isOwn: Boolean(currentUserId) && author._id.toString() === String(currentUserId),
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    edited: review.updatedAt - review.createdAt > 1000,
  };
}

module.exports = {
  getMovieReviews,
  getUserReview,
  saveReview,
  deleteReview,
  toReviewItem,
};
