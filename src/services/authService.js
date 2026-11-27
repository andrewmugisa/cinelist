const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { escapeRegex } = require("../utils/helpers");

async function register(username, email, password) {
  // Usernames are compared case-insensitively so "Andrew" and "andrew" can't both exist.
  const existing = await User.findOne({
    $or: [
      { username: new RegExp(`^${escapeRegex(username)}$`, "i") },
      { email },
    ],
  });

  if (existing) {
    const error = new Error("Username or email is already in use.");
    error.code = "DUPLICATE_USER";
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  return User.create({
    username,
    email,
    passwordHash,
    lastSeenAt: new Date(),
  });
}

async function login(email, password) {
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return null;
  }

  return user;
}

module.exports = {
  register,
  login,
};
