const express = require("express");
const controller = require("../controllers/watchlistApiController");

const router = express.Router();

// For a JSON API we answer 401 with JSON, instead of redirecting to the login page.
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "Please log in first." });
  }
  next();
}

router.get("/api/list", requireLogin, controller.getList);
router.post("/api/list", requireLogin, controller.createEntry);
router.put("/api/list/:movieId", requireLogin, controller.updateEntry);
router.delete("/api/list/:movieId", requireLogin, controller.removeEntry);

module.exports = router;