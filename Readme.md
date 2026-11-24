# CineList

A movie discovery and watchlist app built with **Node.js, Express, Pug, and MongoDB**, using Server-Side Rendering (SSR).

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Rename `.env.example` to `.env`, then add your MongoDB connection URI, your TMDB API authorisation token, and a secure random session secret.

3. **Start the app** (from the project root)

   ```bash
   npm start        # production
   npm run dev      # development, restarts on file changes (Nodemon)
   ```

4. **Open** [http://localhost:3000/](http://localhost:3000/)

## Troubleshooting

- **`Something went wrong. Status: 401`**: the TMDB token in `.env` is missing, invalid or expired. Update it and restart.
- **MongoDB connection errors**: check that `MONGODB_URI` is correct, your Atlas cluster is running, your IP is allowed in Network Access, and your username and password are right.
- **Session errors**: make sure `SESSION_SECRET` is set in `.env`.

## Project Structure

```text
cinelist/
├── src/
│   ├── app.js                  # Express, middleware, sessions, routes and Pug setup
│   ├── server.js               # Loads env, connects to MongoDB, starts the server
│   ├── auth/
│   ├── config/database.js      # Mongoose connection
│   ├── controllers/            # Reserved for request handling logic
│   ├── middleware/auth.js      # Authentication middleware
│   ├── models/                 # Review, User, WatchlistEntry
│   ├── routes/                 # authRoutes, homeRoutes
│   └── services/tmdb.js        # TMDB API integration
├── views/
│   ├── auth/                   # login, signup
│   ├── list/index.pug          # Watchlist
│   ├── movies/movie.pug        # Movie details
│   ├── partials/               # footer, movie-card, navbar
│   ├── profile/                # settings, user-profile
│   ├── 404.pug
│   ├── discover.pug
│   ├── home.pug
│   └── layout.pug              # Shared layout
├── public/
│   ├── css/                    # base, cinelist, components, layout, pages, style, tokens
│   ├── images/
│   └── js/
├── .env.example
├── package.json
└── README.md
```

## Tech Stack

Node.js, Express, Pug, MongoDB Atlas with Mongoose, TMDB API, Express Session with Connect Mongo, and Nodemon for development.

## Architecture

Express handles each request, fetches data from MongoDB or TMDB, and renders a Pug template to HTML. Static assets are served from `public/`.

- **Config and startup:** `src/app.js`, `src/server.js`
- **Routes, middleware, models, services:** `src/routes/`, `src/middleware/`, `src/models/`, `src/services/`
- **Templates and static files:** `views/`, `public/`