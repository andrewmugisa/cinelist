/**
 * Sign up, login and logout.
 */
const userService = require("../services/authService");
const { validateUsername, safeRedirectPath } = require("../utils/helpers");

/**
 * Logs the user in with a fresh session ID (prevents session fixation)
 * and returns the page they were trying to reach before logging in.
 */
function startSession(req, userId) {
  const returnTo = safeRedirectPath(req.session.returnTo, "/");

  return new Promise((resolve, reject) => {
    req.session.regenerate((regenerateError) => {
      if (regenerateError) return reject(regenerateError);

      req.session.userId = userId;
      req.session.save((saveError) => (saveError ? reject(saveError) : resolve(returnTo)));
    });
  });
}

// GET /signup
function signupPage(req, res) {
  res.render("auth/signup", {
    title: "Create account",
    error: null,
  });
}

// POST /signup
async function signup(req, res) {
  const renderError = (error) =>
    res.render("auth/signup", { title: "Create account", error });

  try {
    const username = String(req.body.username || "").trim();
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body.password || "");

    const usernameError = validateUsername(username);
    if (usernameError) return renderError(usernameError);

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return renderError("Please enter a valid email.");
    }

    if (password.length < 8) {
      return renderError("Password must be at least 8 characters.");
    }

    const user = await userService.register(username, email, password);

    res.redirect(await startSession(req, user._id.toString()));
  } catch (error) {
    console.error(error);

    renderError(
      error.code === "DUPLICATE_USER" || error.code === 11000
        ? "Username or email is already in use."
        : "Could not create your account. Please try again.",
    );
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

    res.redirect(await startSession(req, user._id.toString()));
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
