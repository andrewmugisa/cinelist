const User = require("../models/User");

// How often lastSeenAt is written, so we don't update Mongo on every request.
const LAST_SEEN_INTERVAL_MS = 5 * 60 * 1000;

// Loads the logged-in user into res.locals.currentUser (used by the navbar).
async function loadCurrentUser(req, res, next) {
  res.locals.currentUser = null;

  if (!req.session.userId) return next();

  try {
    const user = await User.findById(req.session.userId)
      .select("username lastSeenAt createdAt")
      .lean();

    if (!user) {
      // The account no longer exists: forget it.
      delete req.session.userId;
      return next();
    }

    res.locals.currentUser = user;
    req.currentUser = user;

    const lastSeen = user.lastSeenAt ? user.lastSeenAt.getTime() : 0;
    if (Date.now() - lastSeen > LAST_SEEN_INTERVAL_MS) {
      User.updateOne({ _id: user._id }, { lastSeenAt: new Date() }).catch(
        (error) => console.error("Could not update lastSeenAt:", error.message),
      );
    }
  } catch (error) {
    console.error(error);
  }

  return next();
}

module.exports = { loadCurrentUser };
