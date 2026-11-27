// Small shared helpers for parsing and validating request input.

// Usernames that would clash with routes such as /user/settings.
const RESERVED_USERNAMES = new Set([
  "admin", "api", "discover", "list", "login", "logout",
  "movies", "profile", "search", "settings", "signup", "user",
]);

function parseMovieId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Returns { value } with a whole number 1-10 or undefined (blank), or { error }.
function parseScore(value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return { value: undefined };
  }
  const score = Number(value);
  if (!Number.isInteger(score) || score < 1 || score > 10) {
    return { error: "Score must be a whole number from 1 to 10." };
  }
  return { value: score };
}

// Returns an error message, or null if the username is acceptable.
function validateUsername(username) {
  if (username.length < 3 || username.length > 30) {
    return "Username must be between 3 and 30 characters.";
  }
  if (!/^[A-Za-z0-9_.-]+$/.test(username)) {
    return "Username can only contain letters, numbers, dots, dashes and underscores.";
  }
  if (RESERVED_USERNAMES.has(username.toLowerCase())) {
    return "That username is not available.";
  }
  return null;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Only allow redirects to paths on this site (blocks //evil.com and URLs).
function safeRedirectPath(value, fallback = "/") {
  const path = String(value || "");
  if (path.startsWith("/") && !path.startsWith("//") && !path.includes("\\")) {
    return path;
  }
  return fallback;
}

function toArray(value) {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function formatDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return null;
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

module.exports = {
  RESERVED_USERNAMES,
  parseMovieId,
  parseScore,
  validateUsername,
  escapeRegex,
  safeRedirectPath,
  toArray,
  formatDate,
  formatDateTime,
};
