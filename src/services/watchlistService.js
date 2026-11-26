const WatchlistEntry = require("../models/WatchlistEntry");

const { STATUSES } = WatchlistEntry;

function getEntry(userId, movieId) {
  return WatchlistEntry.findOne({ userId, movieId }).lean();
}

// Builds the $set/$unset update for status, score and notes.
// Fields that are undefined are left unchanged; a blank score/notes is removed.
function buildUpdate({ status, score, notes }) {
  const $set = {};
  const $unset = {};

  if (status !== undefined) $set.status = status;

  if (score === null) $unset.score = "";
  else if (score !== undefined) $set.score = score;

  if (notes === null) $unset.notes = "";
  else if (notes !== undefined) $set.notes = notes;

  const update = {};
  if (Object.keys($set).length) update.$set = $set;
  if (Object.keys($unset).length) update.$unset = $unset;
  return update;
}

// Adds a movie to the list, or updates it if it's already there.
// `movie` is a summary from tmdb.toMovieSummary().
async function saveEntry(userId, movie, fields) {
  const update = buildUpdate(fields);
  update.$set = {
    ...(update.$set || {}),
    title: movie.title,
    posterPath: movie.posterPath,
    releaseDate: movie.releaseDate,
  };

  return WatchlistEntry.findOneAndUpdate(
    { userId, movieId: movie.movieId },
    update,
    { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true },
  ).lean();
}

// Updates an entry that already exists. Returns null if it isn't on the list.
async function updateEntry(userId, movieId, fields) {
  const update = buildUpdate(fields);
  if (!update.$set && !update.$unset) return getEntry(userId, movieId);

  return WatchlistEntry.findOneAndUpdate({ userId, movieId }, update, {
    returnDocument: "after",
    runValidators: true,
  }).lean();
}

async function removeEntry(userId, movieId) {
  const result = await WatchlistEntry.deleteOne({ userId, movieId });
  return result.deletedCount > 0;
}

function getList(userId, status) {
  const filter = { userId };
  if (status) filter.status = status;
  return WatchlistEntry.find(filter).sort({ updatedAt: -1 }).lean();
}

function getRecentByStatus(userId, status, limit = 5) {
  return WatchlistEntry.find({ userId, status })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();
}

async function countByStatus(userId) {
  const rows = await WatchlistEntry.aggregate([
    { $match: { userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const counts = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  for (const row of rows) counts[row._id] = row.count;
  return counts;
}

// Shape used by the views (matches the fields the profile template reads).
function toListItem(entry) {
  return {
    id: entry.movieId,
    movieId: entry.movieId,
    title: entry.title,
    posterPath: entry.posterPath,
    releaseDate: entry.releaseDate,
    releaseYear: entry.releaseDate ? entry.releaseDate.slice(0, 4) : null,
    status: entry.status,
    score: entry.score ?? null,
    notes: entry.notes || "",
    addedAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  };
}

module.exports = {
  STATUSES,
  getEntry,
  saveEntry,
  updateEntry,
  removeEntry,
  getList,
  getRecentByStatus,
  countByStatus,
  toListItem,
};
