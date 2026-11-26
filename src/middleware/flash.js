// One-time messages that survive a redirect.
// Controllers call req.flash("error" | "success", message);
// the next rendered page receives them as `flash` ({ error, success }).
function flash(req, res, next) {
  res.locals.flash = req.session.flash || {};
  delete req.session.flash;

  req.flash = (type, message) => {
    req.session.flash = { ...(req.session.flash || {}), [type]: message };
  };

  next();
}

module.exports = { flash };
