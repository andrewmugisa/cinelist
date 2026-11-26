const express = require("express");
const controller = require("../controllers/movieController");

const router = express.Router();

router.get("/", controller.getHome);
router.get("/discover/:category", controller.discover);
router.get("/search", controller.search);

module.exports = router;
