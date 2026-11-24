const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const User = require("./models/User");
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// View engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../views"));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../public")));

// Sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  }),
);

// Current user
app.use(async (req, res, next) => {
  res.locals.currentUser = null;

  try {
    if (req.session.userId) {
      res.locals.currentUser = await User.findById(req.session.userId).select(
        "username",
      );
    }
  } catch (error) {
    console.error(error);
  }

  next();
});

// Routes
app.use(homeRoutes);
app.use(authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).render("404", { title: "Not found" });
});

module.exports = app;
