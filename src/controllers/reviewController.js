const tmdb = require("../services/tmdb");
const reviewService = require("../services/reviewService");
const { parseMovieId } = require("../utils/helpers");

// POST /movies/:id/reviews  (body: title?, content)
// Creates the user's review, or replaces their existing one.
async function saveReview(req, res) {
  const movieId = parseMovieId(req.params.id);
  if (!movieId) return res.status(404).render("404", { title: "Not found" });

  const back = `/movies/${movieId}#reviews`;
  const title = String(req.body.title || "").trim();
  const content = String(req.body.content || "").trim();

  if (!content) {
    req.flash("error", "Your review can't be empty.");
    return res.redirect(back);
  }
  if (content.length > 10000) {
    req.flash("error", "Reviews can be at most 10,000 characters.");
    return res.redirect(back);
  }
  if (title.length > 120) {
    req.flash("error", "Review titles can be at most 120 characters.");
    return res.redirect(back);
  }

  // Make sure the movie exists before storing a review for it.
  try {
    await tmdb.getMovieDetails(movieId);
  } catch (error) {
    if (error.status === 404) return res.status(404).render("404", { title: "Not found" });
    console.error("TMDB:", error.message);
    req.flash("error", "Could not reach TMDB. Please try again.");
    return res.redirect(back);
  }

  await reviewService.saveReview(req.session.userId, movieId, { title, content });
  req.flash("success", "Your review has been saved.");
  return res.redirect(back);
}

// POST /movies/:id/reviews/delete
async function deleteReview(req, res) {
  const movieId = parseMovieId(req.params.id);
  if (!movieId) return res.status(404).render("404", { title: "Not found" });

  const removed = await reviewService.deleteReview(req.session.userId, movieId);
  req.flash(removed ? "success" : "error", removed ? "Your review was deleted." : "You haven't reviewed this movie.");
  return res.redirect(`/movies/${movieId}#reviews`);
}

module.exports = { saveReview, deleteReview };
