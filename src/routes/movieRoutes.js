const express = require("express");
const movieController = require("../controllers/movieController");
const reviewController = require("../controllers/reviewController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/movies/:id", movieController.movieDetail);

// Reviews (one per user per movie; posting again edits it)
router.post("/movies/:id/reviews", requireAuth, reviewController.saveReview);
router.post("/movies/:id/reviews/delete", requireAuth, reviewController.deleteReview);

module.exports = router;
