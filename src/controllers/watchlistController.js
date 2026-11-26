const tmdb = require("../services/tmdb");
const watchlistService = require("../services/watchlistService");
const userService = require("../services/userService");
const { parseMovieId, parseScore, safeRedirectPath } = require("../utils/helpers");

const { STATUSES } = watchlistService;

/**
 * Reads status/score/notes from a form.
 * - field missing from the form -> undefined (leave unchanged)
 * - field sent but blank       -> null (clear it)
 */
function readEntryFields(body) {
  const fields = {};

  if (body.status !== undefined && body.status !== "") {
    if (!STATUSES.includes(body.status)) return { error: "Please choose a valid status." };
    fields.status = body.status;
  }

  if (body.score !== undefined) {
    const { value, error } = parseScore(body.score);
    if (error) return { error };
    fields.score = value === undefined ? null : value;
  }

  if (body.notes !== undefined) {
    const notes = String(body.notes).trim();
    if (notes.length > 2000) return { error: "Notes can be at most 2000 characters." };
    fields.notes = notes || null;
  }

  return { fields };
}

function backTo(req, fallback) {
  return safeRedirectPath(req.body.redirectTo, fallback);
}

async function renderList(req, res, owner, isOwnList) {
  const requested = req.query.status;
  const statusFilter = STATUSES.includes(requested) ? requested : null;

  const [entries, counts] = await Promise.all([
    watchlistService.getList(owner._id, statusFilter),
    watchlistService.countByStatus(owner._id),
  ]);

  const items = entries.map(watchlistService.toListItem);
  const entriesByStatus = Object.fromEntries(STATUSES.map((status) => [status, []]));
  for (const item of items) entriesByStatus[item.status].push(item);

  res.render("list/index", {
    title: isOwnList ? "My list" : `${owner.username}'s list`,
    listOwner: {
      username: owner.username,
      profilePath: `/user/${encodeURIComponent(owner.username)}`,
    },
    isOwnList,
    entries: items,
    entriesByStatus,
    statuses: STATUSES,
    statusFilter,
    counts,
    totalCount: Object.values(counts).reduce((sum, count) => sum + count, 0),
  });
}

// GET /list (logged-in user's own list)
async function myList(req, res) {
  const owner = await userService.findById(req.session.userId);
  if (!owner) return res.redirect("/login");
  return renderList(req, res, owner, true);
}

// GET /user/:username/list (anyone's list, public)
async function userList(req, res) {
  const owner = await userService.findByUsername(req.params.username);
  if (!owner) return res.status(404).render("404", { title: "Not found" });
  const isOwnList = owner._id.toString() === req.session.userId;
  return renderList(req, res, owner, isOwnList);
}

// POST /list  (body: movieId, status?, score?, notes?, redirectTo?)
// Adds a movie to the list, or updates it if already there.
async function saveEntry(req, res) {
  const movieId = parseMovieId(req.body.movieId);
  const fallback = movieId ? `/movies/${movieId}` : "/list";

  if (!movieId) {
    req.flash("error", "Unknown movie.");
    return res.redirect(backTo(req, fallback));
  }

  const { fields, error } = readEntryFields(req.body);
  if (error) {
    req.flash("error", error);
    return res.redirect(backTo(req, fallback));
  }

  let movie;
  try {
    movie = tmdb.toMovieSummary(await tmdb.getMovieDetails(movieId));
  } catch (tmdbError) {
    console.error("TMDB:", tmdbError.message);
    req.flash(
      "error",
      tmdbError.status === 404 ? "That movie doesn't exist." : "Could not reach TMDB. Please try again.",
    );
    return res.redirect(backTo(req, fallback));
  }

  await watchlistService.saveEntry(req.session.userId, movie, fields);
  req.flash("success", `Saved "${movie.title}" to your list.`);
  return res.redirect(backTo(req, fallback));
}

// POST /list/:movieId/update  (body: status?, score?, notes?, redirectTo?)
async function updateEntry(req, res) {
  const movieId = parseMovieId(req.params.movieId);
  if (!movieId) return res.redirect(backTo(req, "/list"));

  const { fields, error } = readEntryFields(req.body);
  if (error) {
    req.flash("error", error);
    return res.redirect(backTo(req, "/list"));
  }

  const entry = await watchlistService.updateEntry(req.session.userId, movieId, fields);
  req.flash(entry ? "success" : "error", entry ? `Updated "${entry.title}".` : "That movie isn't on your list.");
  return res.redirect(backTo(req, "/list"));
}

// POST /list/:movieId/delete  (body: redirectTo?)
async function removeEntry(req, res) {
  const movieId = parseMovieId(req.params.movieId);
  if (movieId) {
    const removed = await watchlistService.removeEntry(req.session.userId, movieId);
    req.flash(removed ? "success" : "error", removed ? "Removed from your list." : "That movie isn't on your list.");
  }
  return res.redirect(backTo(req, "/list"));
}

module.exports = {
  myList,
  userList,
  saveEntry,
  updateEntry,
  removeEntry,
};
