const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function register(username, email, password) {
  const existing = await User.findOne({
    $or: [{ username }, { email }],
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
