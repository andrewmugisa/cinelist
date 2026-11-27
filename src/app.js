const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const { loadCurrentUser } = require("./middleware/currentUser");
const { flash } = require("./middleware/flash");
const { requireSameOrigin } = require("./middleware/sameOrigin");

const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const listRoutes = require("./routes/listRoutes");
const profileRoutes = require("./routes/profileRoutes");
const apiRoutes = require("./routes/apiRoutes");
const watchlistApiRoutes = require("./routes/watchlistApiRoutes");
const app = express();

// View engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../views"));

// Middleware
app.use(express.urlencoded({ extended: false, limit: "100kb" }));
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(__dirname, "../public")));

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 14, // 14 days
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  }),
);

app.use(requireSameOrigin);
app.use(flash);
app.use(loadCurrentUser);

// Routes
app.use(homeRoutes);
app.use(authRoutes);
app.use(movieRoutes);
app.use(listRoutes);
app.use(profileRoutes);
app.use(apiRoutes);
app.use(watchlistApiRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).render("404", { title: "Not found" });
});

// Error handler (Express 5 forwards errors thrown in async handlers here)
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return;
  if (req.path.startsWith("/api/")) {
    return res.status(500).json({ error: "Something went wrong." });
  }
  return res.status(500).send("Something went wrong. Please try again.");
});

module.exports = app;
