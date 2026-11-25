const express = require("express");
const controller = require("../controllers/authController");

const router = express.Router();

router.get("/signup", controller.signupPage);
router.post("/signup", controller.signup);

router.get("/login", controller.loginPage);
router.post("/login", controller.login);

router.post("/logout", controller.logout);

module.exports = router;
