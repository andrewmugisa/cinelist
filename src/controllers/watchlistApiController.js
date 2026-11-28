const tmdb = require("../services/tmdb");
const watchlistService = require("../services/watchlistService");
const { parseMovieId, parseScore } = require("../utils/helpers");

// GET /api/list -> the logged-in user's list as JSON
async function getList(req, res) {
  const entries = await watchlistService.getList(req.session.userId);
  res.json({ count: entries.length, entries });
}

// POST /api/list  (JSON body: { "movieId": 1368337, "status": "Watching", "score": 8 })
async function createEntry(req, res) {
  const body = req.body || {};

  const movieId = parseMovieId(body.movieId);
  if (!movieId) return res.status(400).json({ error: "A valid movieId is required." });

  if (body.status !== undefined && !watchlistService.STATUSES.includes(body.status)) {
    return res.status(400).json({ error: "Please choose a valid status." });
  }

  const { value, error } = parseScore(body.score);
  if (error) return res.status(400).json({ error });

  let movie;
  try {
    movie = tmdb.toMovieSummary(await tmdb.getMovieDetails(movieId));
  } catch (tmdbError) {
    const status = tmdbError.status === 404 ? 404 : 502;
    return res.status(status).json({ error: "Could not load that movie from TMDB." });
  }

  const entry = await watchlistService.saveEntry(req.session.userId, movie, {
    status: body.status,
    score: value,
  });
  res.status(201).json(entry);
}

// PUT /api/list/:movieId  (JSON body: { "status": "Completed", "score": 9 })
async function updateEntry(req, res) {
  const body = req.body || {};

  const movieId = parseMovieId(req.params.movieId);
  if (!movieId) return res.status(400).json({ error: "Invalid movie id." });

  if (body.status !== undefined && !watchlistService.STATUSES.includes(body.status)) {
    return res.status(400).json({ error: "Please choose a valid status." });
  }

  const { value, error } = parseScore(body.score);
  if (error) return res.status(400).json({ error });

  const entry = await watchlistService.updateEntry(req.session.userId, movieId, {
    status: body.status,
    score: value,
  });
  if (!entry) return res.status(404).json({ error: "That movie isn't on your list." });

  res.json(entry);
}

// DELETE /api/list/:movieId -> remove one movie from the list
async function removeEntry(req, res) {
  const movieId = parseMovieId(req.params.movieId);
  if (!movieId) return res.status(400).json({ error: "Invalid movie id." });

  const removed = await watchlistService.removeEntry(req.session.userId, movieId);
  if (!removed) return res.status(404).json({ error: "That movie isn't on your list." });

  res.json({ message: "Removed from your list." });
}

// DELETE /api/list/:movieId/score -> remove only the score, keep the movie
async function removeScore(req, res) {
  const movieId = parseMovieId(req.params.movieId);
  if (!movieId) return res.status(400).json({ error: "Invalid movie id." });

  const entry = await watchlistService.updateEntry(req.session.userId, movieId, { score: null });
  if (!entry) return res.status(404).json({ error: "That movie isn't on your list." });

  res.json(entry);
}

module.exports = { getList, createEntry, updateEntry, removeEntry, removeScore };