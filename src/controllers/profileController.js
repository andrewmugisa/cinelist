const tmdb = require("../services/tmdb");
const userService = require("../services/userService");
const watchlistService = require("../services/watchlistService");
const {
  parseMovieId,
  validateUsername,
  toArray,
  formatDate,
  formatDateTime,
} = require("../utils/helpers");

const MAX_FAVORITES = 10;

function profilePathFor(username) {
  return `/user/${encodeURIComponent(username)}`;
}

// GET /profile -> the logged-in user's public profile
async function myProfile(req, res) {
  const user = await userService.findById(req.session.userId);
  if (!user) return res.redirect("/login");
  return res.redirect(profilePathFor(user.username));
}

// GET /user/:username
async function userProfile(req, res) {
  const user = await userService.findByUsername(req.params.username);
  if (!user) return res.status(404).render("404", { title: "Not found" });

  const [watching, completed, counts] = await Promise.all([
    watchlistService.getRecentByStatus(user._id, "Watching", 5),
    watchlistService.getRecentByStatus(user._id, "Completed", 5),
    watchlistService.countByStatus(user._id),
  ]);

  res.render("profile/user-profile", {
    title: user.username,
    profileUser: { username: user.username },
    isOwnProfile: user._id.toString() === req.session.userId,
    currentlyWatching: watching.map(watchlistService.toListItem),
    recentlyCompleted: completed.map(watchlistService.toListItem),
    favoriteMovies: (user.favoriteMovies || []).map(userService.toFavoriteItem),
    listCounts: counts,
    lastOnline: formatDateTime(user.lastSeenAt),
    joinedDate: formatDate(user.createdAt),
  });
}

// GET /user/settings -> /settings (the settings form posts to /user/settings)
function redirectToSettings(req, res) {
  res.redirect("/settings");
}

// GET /settings
async function settingsPage(req, res) {
  const user = await userService.findById(req.session.userId);
  if (!user) return res.redirect("/login");

  res.render("profile/settings", {
    title: "Settings",
    profileUser: { username: user.username },
    favoriteMovies: (user.favoriteMovies || []).map(userService.toFavoriteItem),
  });
}

/**
 * Works out the new ordered list of favourite movie IDs from the form:
 * - favoriteMovieIds[]: one hidden input per slot (blank = empty slot)
 * - favoriteSlot + favoriteMovieId: a movie picked in the search panel for one slot
 */
function readFavoriteIds(body) {
  const slots = toArray(body.favoriteMovieIds ?? body["favoriteMovieIds[]"])
    .slice(0, MAX_FAVORITES)
    .map((value) => parseMovieId(value));

  const slot = Number.parseInt(body.favoriteSlot, 10);
  const pickedId = parseMovieId(body.favoriteMovieId);
  if (pickedId && slot >= 1 && slot <= MAX_FAVORITES) {
    while (slots.length < slot) slots.push(null);
    slots[slot - 1] = pickedId;
  }

  // Drop empty slots and duplicates, keeping the order.
  return [...new Set(slots.filter(Boolean))].slice(0, MAX_FAVORITES);
}

// Re-uses cached favourites and only asks TMDB about newly added movies.
async function buildFavorites(ids, existing) {
  const cached = new Map(existing.map((favorite) => [favorite.movieId, favorite]));

  return Promise.all(
    ids.map(async (movieId) => {
      if (cached.has(movieId)) return cached.get(movieId);
      return tmdb.toMovieSummary(await tmdb.getMovieDetails(movieId));
    }),
  );
}

// POST /user/settings (and POST /settings)
async function saveSettings(req, res) {
  const user = await userService.findById(req.session.userId);
  if (!user) return res.redirect("/login");

  const username = String(req.body.username ?? user.username).trim();
  const usernameError = validateUsername(username);
  if (usernameError) {
    req.flash("error", usernameError);
    return res.redirect("/settings");
  }

  if (
    username.toLowerCase() !== user.username.toLowerCase() &&
    (await userService.isUsernameTaken(username, user._id))
  ) {
    req.flash("error", "That username is already taken.");
    return res.redirect("/settings");
  }

  let favoriteMovies;
  try {
    favoriteMovies = await buildFavorites(readFavoriteIds(req.body), user.favoriteMovies || []);
  } catch (error) {
    console.error("TMDB:", error.message);
    req.flash(
      "error",
      error.status === 404
        ? "One of the selected movies couldn't be found."
        : "Could not reach TMDB to save your favourites. Please try again.",
    );
    return res.redirect("/settings");
  }

  try {
    await userService.updateProfile(user._id, { username, favoriteMovies });
  } catch (error) {
    if (error.code === 11000) {
      req.flash("error", "That username is already taken.");
      return res.redirect("/settings");
    }
    throw error;
  }

  req.flash("success", "Your settings have been saved.");
  return res.redirect("/settings");
}

module.exports = {
  myProfile,
  userProfile,
  redirectToSettings,
  settingsPage,
  saveSettings,
};
