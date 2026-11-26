// Basic CSRF protection: reject form posts that come from another website.
// Browsers send an Origin header on POST requests; if it doesn't match our host, refuse.
function requireSameOrigin(req, res, next) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();

  const source = req.get("origin") || req.get("referer");
  if (!source) return next();

  try {
    if (new URL(source).host === req.get("host")) return next();
  } catch {
    // Malformed header: fall through and reject.
  }

  return res.status(403).send("Request blocked: cross-site form submission.");
}

module.exports = { requireSameOrigin };
