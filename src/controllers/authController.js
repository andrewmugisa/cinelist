/**
 * This file will do auth and CRUD operations
 */

//used to to do CRUD operations with users/ user accounts
const userService = require("../services/authService");

//used to to do CRUD operations with Movies
//const movieService = require("../services/movieService");

//public endpoint / should return home.pug if necessary

//CRUD
//Creat user

// GET /signup
function signupPage(req, res) {
  res.render("auth/signup", {
    title: "Create account",
    error: null,
  });
}

// POST /signup
async function signup(req, res) {
  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    if (username.length < 3 || username.length > 30) {
      return res.render("auth/signup", {
        title: "Create account",
        error: "Username must be between 3 and 30 characters.",
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.render("auth/signup", {
        title: "Create account",
        error: "Please enter a valid email.",
      });
    }

    if (password.length < 8) {
      return res.render("auth/signup", {
        title: "Create account",
        error: "Password must be at least 8 characters.",
      });
    }

    const user = await userService.register(username, email, password);

    req.session.userId = user._id.toString();

    res.redirect("/");
  } catch (error) {
    console.error(error);

    const message =
      error.code === "DUPLICATE_USER" || error.code === 11000
        ? "Username or email is already in use."
        : "Could not create your account. Please try again.";

    res.render("auth/signup", {
      title: "Create account",
      error: message,
    });
  }
}

// GET /login
function loginPage(req, res) {
  res.render("auth/login", {
    title: "Login",
    error: null,
  });
}

// POST /login
async function login(req, res) {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    const user = await userService.login(email, password);

    if (!user) {
      return res.render("auth/login", {
        title: "Login",
        error: "Email or password is incorrect.",
      });
    }

    req.session.userId = user._id.toString();

    res.redirect("/");
  } catch (error) {
    console.error(error);

    res.render("auth/login", {
      title: "Login",
      error: "Login failed. Please try again.",
    });
  }
}

// POST /logout
function logout(req, res) {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).send("Could not log out.");
    }

    res.clearCookie("connect.sid");
    res.redirect("/");
  });
}

module.exports = {
  signupPage,
  signup,
  loginPage,
  login,
  logout,
};
