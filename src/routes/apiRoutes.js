const express = require("express");
const movieController = require("../controllers/movieController");

const router = express.Router();

// JSON endpoints for client-side scripts.
router.get("/api/movies/search", movieController.apiSearchMovies);

module.exports = router;
