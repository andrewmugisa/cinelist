const express = require("express");
const profileController = require("../controllers/profileController");
const watchlistController = require("../controllers/watchlistController");
const { requireAuth } = require("../middleware/auth");
const { settingsForm } = require("../middleware/upload");

const router = express.Router();

router.get("/profile", requireAuth, profileController.myProfile);

router.get("/settings", requireAuth, profileController.settingsPage);
router.post("/settings", requireAuth, settingsForm, profileController.saveSettings);

// The settings form posts here. These must come before /user/:username.
router.get("/user/settings", profileController.redirectToSettings);
router.post("/user/settings", requireAuth, settingsForm, profileController.saveSettings);

router.get("/user/:username", profileController.userProfile);
router.get("/user/:username/list", watchlistController.userList);

module.exports = router;
