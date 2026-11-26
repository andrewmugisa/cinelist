# CineList

A movie discovery and watchlist app built with **Node.js, Express, Pug, and MongoDB**, using Server-Side Rendering (SSR).

## Getting Started

1. **Install dependencies** (run again after pulling, e.g. to get `multer`)

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
│   ├── config/database.js      # Mongoose connection
│   ├── controllers/            # auth, movie, watchlist, review, profile
│   ├── middleware/             # auth, currentUser, flash, sameOrigin (CSRF), upload
│   ├── models/                 # Review, User, WatchlistEntry
│   ├── routes/                 # auth, home, movie, list, profile, api
│   ├── services/               # tmdb.js (all TMDB requests), auth, user, watchlist, review
│   └── utils/helpers.js        # input parsing/validation helpers
├── views/                      # Pug templates
├── public/                     # css/, images/, js/
├── .env.example
├── package.json
└── README.md
```

## Routes

| Method | Path | Login | What it does |
| --- | --- | --- | --- |
| GET | `/` | | Home: popular, top rated, upcoming |
| GET | `/discover/:category?page=N` | | `popular`, `top-rated`, `upcoming`, `now-playing` |
| GET | `/search?q=&type=movie\|user&page=N` | | Search movies (TMDB) or users |
| GET | `/movies/:id` | | Movie details, your list entry, reviews |
| POST | `/movies/:id/reviews` | ✓ | Create or edit your review (`title?`, `content`) |
| POST | `/movies/:id/reviews/delete` | ✓ | Delete your review |
| GET | `/list?status=` | ✓ | Your list (optional status filter) |
| POST | `/list` | ✓ | Add/update a movie (`movieId`, `status?`, `score?`, `notes?`, `redirectTo?`) |
| POST | `/list/:movieId/update` | ✓ | Update `status` / `score` / `notes` (blank clears score/notes) |
| POST | `/list/:movieId/delete` | ✓ | Remove from list |
| GET | `/profile` | ✓ | Redirects to `/user/:username` |
| GET | `/user/:username` | | Public profile |
| GET | `/user/:username/list?status=` | | Public list |
| GET | `/settings` | ✓ | Settings page |
| POST | `/user/settings` (or `/settings`) | ✓ | Save username and favourites |
| GET | `/api/movies/search?q=` | | JSON results for the favourites picker |

`redirectTo` must be a path on this site (e.g. `/movies/550`); anything else is ignored.

## Data passed to views

Every page gets `currentUser` (or `null`) and `flash` (`{ error, success }`, one-time messages after a redirect).

- **`search`**: `query`, `searchType`, `movies` (TMDB results), `users` (`username`, `profilePath`, `joinedDate`), `page`, `totalPages`, `hasNextPage`, `tmdbError`.
- **`movies/movie`**: `movie` (TMDB details plus `releaseYear`, `genreNames`, `cast`, `directors`, `trailerUrl`), `watchlistEntry` (or `null`), `statuses`, `reviews` (`id`, `title`, `content`, `username`, `profilePath`, `isOwn`, `createdAt`, `updatedAt`, `edited`), `userReview`, `tmdbError`.
- **`list/index`**: `listOwner` (`username`, `profilePath`), `isOwnList`, `entries`, `entriesByStatus`, `statuses`, `statusFilter`, `counts`, `totalCount`. Each entry has `id`, `title`, `posterPath`, `releaseYear`, `status`, `score`, `notes`, `addedAt`, `updatedAt`.
- **`profile/user-profile`**: `profileUser`, `isOwnProfile`, `currentlyWatching`, `recentlyCompleted`, `favoriteMovies`, `listCounts`, `lastOnline`, `joinedDate`.
- **`profile/settings`**: `profileUser`, `favoriteMovies` (`id`, `title`, `posterPath`).

Profile and background image uploads are not implemented yet; the settings form's file inputs are ignored.

## Tech Stack

Node.js, Express, Pug, MongoDB Atlas with Mongoose, TMDB API, Express Session with Connect Mongo, and Nodemon for development.

## Architecture

Express handles each request, fetches data from MongoDB or TMDB, and renders a Pug template to HTML. Static assets are served from `public/`.

- **Config and startup:** `src/app.js`, `src/server.js`
- **Routes, middleware, models, services:** `src/routes/`, `src/middleware/`, `src/models/`, `src/services/`
- **Templates and static files:** `views/`, `public/`