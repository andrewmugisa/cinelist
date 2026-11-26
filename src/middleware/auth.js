// Redirects logged-out visitors to the login page.
// For page views (GET) the original URL is remembered so login can send them back.
function requireAuth(req, res, next) {
  if (req.session.userId) return next();

  if (req.method === "GET") {
    req.session.returnTo = req.originalUrl;
  }
  return res.redirect("/login");
}

// Sends logged-in users away from login/signup pages.
function redirectIfLoggedIn(req, res, next) {
  if (req.session.userId) return res.redirect("/");
  return next();
}

module.exports = { requireAuth, redirectIfLoggedIn };
