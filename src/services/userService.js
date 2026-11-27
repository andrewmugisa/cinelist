const User = require("../models/User");
const { escapeRegex } = require("../utils/helpers");

const PUBLIC_FIELDS = "username favoriteMovies lastSeenAt createdAt";

function exactUsername(username) {
  return new RegExp(`^${escapeRegex(username)}$`, "i");
}

function findByUsername(username) {
  return User.findOne({ username: exactUsername(username) })
    .select(PUBLIC_FIELDS)
    .lean();
}

function findById(userId) {
  return User.findById(userId).select(PUBLIC_FIELDS).lean();
}

// Usernames containing the search text, closest matches (prefix) first.
async function searchUsers(query, limit = 20) {
  const users = await User.find({
    username: new RegExp(escapeRegex(query), "i"),
  })
    .select("username createdAt")
    .limit(limit)
    .lean();

  const lower = query.toLowerCase();
  return users.sort((a, b) => {
    const aPrefix = a.username.toLowerCase().startsWith(lower) ? 0 : 1;
    const bPrefix = b.username.toLowerCase().startsWith(lower) ? 0 : 1;
    return aPrefix - bPrefix || a.username.localeCompare(b.username);
  });
}

async function isUsernameTaken(username, exceptUserId) {
  const existing = await User.findOne({
    username: exactUsername(username),
    _id: { $ne: exceptUserId },
  })
    .select("_id")
    .lean();
  return Boolean(existing);
}

function updateProfile(userId, { username, favoriteMovies }) {
  return User.findByIdAndUpdate(
    userId,
    { $set: { username, favoriteMovies } },
    { returnDocument: "after", runValidators: true },
  ).lean();
}

// Shape used by the views for favourite movies.
function toFavoriteItem(favorite) {
  return {
    id: favorite.movieId,
    movieId: favorite.movieId,
    title: favorite.title,
    posterPath: favorite.posterPath,
    releaseDate: favorite.releaseDate,
  };
}

module.exports = {
  findByUsername,
  findById,
  searchUsers,
  isUsernameTaken,
  updateProfile,
  toFavoriteItem,
};
