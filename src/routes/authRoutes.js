const express = require("express");
const controller = require("../controllers/authController");
const { redirectIfLoggedIn } = require("../middleware/auth");

const router = express.Router();

router.get("/signup", redirectIfLoggedIn, controller.signupPage);
router.post("/signup", redirectIfLoggedIn, controller.signup);

router.get("/login", redirectIfLoggedIn, controller.loginPage);
router.post("/login", redirectIfLoggedIn, controller.login);

router.post("/logout", controller.logout);

module.exports = router;
