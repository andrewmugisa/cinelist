const express = require("express");
const controller = require("../controllers/watchlistController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/list", requireAuth, controller.myList);
router.post("/list", requireAuth, controller.saveEntry);
router.post("/list/:movieId/update", requireAuth, controller.updateEntry);
router.post("/list/:movieId/delete", requireAuth, controller.removeEntry);

module.exports = router;
