const express = require("express");
const controller = require("../controllers/movieController");

const router = express.Router();

router.get("/", controller.getPopularMovies);
router.get("/search", controller.searchMovies);

module.exports = router;
