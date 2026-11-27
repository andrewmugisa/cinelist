const tmdb = require("../services/tmdb");
const watchlistService = require("../services/watchlistService");
const reviewService = require("../services/reviewService");
const userService = require("../services/userService");
const { parseMovieId, formatDate } = require("../utils/helpers");

// Number of movies shown in each row on the home page.
const HOME_ROW_SIZE = 10;

function renderNotFound(res) {
  return res.status(404).render("404", { title: "Not found" });
}

// GET /
async function getHome(req, res) {
  const [popular, topRated, upcoming] = await Promise.allSettled([
    tmdb.getPopularMovies(),
    tmdb.getTopRatedMovies(),
    tmdb.getUpcomingMovies(),
  ]);

  const rows = [popular, topRated, upcoming];
  rows
    .filter((row) => row.status === "rejected")
    .forEach((row) => console.error("TMDB:", row.reason.message));

  const moviesFrom = (row) =>
    row.status === "fulfilled" ? row.value.movies.slice(0, HOME_ROW_SIZE) : [];

  res.render("home", {
    title: "CineList",
    popularMovies: moviesFrom(popular),
    topRatedMovies: moviesFrom(topRated),
    upcomingMovies: moviesFrom(upcoming),
    tmdbError: rows.some((row) => row.status === "rejected")
      ? "Some movie data is temporarily unavailable. Check your TMDB configuration."
      : null,
  });
}

// GET /discover/:category?page=N
async function discover(req, res) {
  const { category } = req.params;
  if (!tmdb.isValidCategory(category)) return renderNotFound(res);

  const { heading } = tmdb.CATEGORIES[category];

  try {
    const result = await tmdb.getMovieCategory(category, req.query.page);
    res.render("discover", {
      title: heading,
      heading,
      category,
      movies: result.movies,
      page: result.page,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      tmdbError: null,
    });
  } catch (error) {
    console.error("TMDB:", error.message);
    res.status(502).render("discover", {
      title: heading,
      heading,
      category,
      movies: [],
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      tmdbError: "Movie data is temporarily unavailable.",
    });
  }
}

// GET /search?q=...&type=movie|user&page=N
async function search(req, res) {
  const query = String(req.query.q || "").trim().slice(0, 100);
  const searchType = req.query.type === "user" ? "user" : "movie";

  if (!query) return res.redirect("/");

  // The navbar search box reads these to keep the user's search filled in.
  res.locals.searchQuery = query;
  res.locals.searchType = searchType;

  const view = {
    title: `Search: ${query}`,
    query,
    searchType,
    movies: [],
    users: [],
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    tmdbError: null,
  };

  if (searchType === "user") {
    const users = await userService.searchUsers(query);
    view.users = users.map((user) => ({
      username: user.username,
      profilePath: `/user/${encodeURIComponent(user.username)}`,
      joinedDate: formatDate(user.createdAt),
    }));
    return res.render("search", view);
  }

  try {
    const result = await tmdb.searchMovies(query, req.query.page);
    Object.assign(view, {
      movies: result.movies,
      page: result.page,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
    });
  } catch (error) {
    console.error("TMDB:", error.message);
    view.tmdbError = "Search is temporarily unavailable.";
  }

  return res.render("search", view);
}

// Extra fields derived from the TMDB details, so the template stays simple.
function describeMovie(movie) {
  const credits = movie.credits || {};
  const videos = (movie.videos && movie.videos.results) || [];
  const trailer =
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer" && v.official) ||
    videos.find((v) => v.site === "YouTube" && v.type === "Trailer");

  return {
    ...movie,
    releaseYear: movie.release_date ? movie.release_date.slice(0, 4) : null,
    genreNames: (movie.genres || []).map((genre) => genre.name),
    cast: (credits.cast || []).slice(0, 12),
    directors: (credits.crew || []).filter((person) => person.job === "Director"),
    trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
  };
}

// GET /movies/:id
async function movieDetail(req, res) {
  const movieId = parseMovieId(req.params.id);
  if (!movieId) return renderNotFound(res);

  let movie;
  try {
    movie = await tmdb.getMovieDetails(movieId);
  } catch (error) {
    if (error.status === 404) return renderNotFound(res);
    console.error("TMDB:", error.message);
    return res.status(502).render("movies/movie", {
      title: "Movie unavailable",
      movie: null,
      tmdbError: "Movie details are temporarily unavailable.",
      watchlistEntry: null,
      statuses: watchlistService.STATUSES,
      reviews: [],
      userReview: null,
    });
  }

  const userId = req.session.userId;
  const [entry, reviews] = await Promise.all([
    userId ? watchlistService.getEntry(userId, movieId) : null,
    reviewService.getMovieReviews(movieId),
  ]);

  const reviewItems = reviews.map((review) => reviewService.toReviewItem(review, userId));

  res.render("movies/movie", {
    title: movie.title,
    movie: describeMovie(movie),
    tmdbError: null,
    watchlistEntry: entry ? watchlistService.toListItem(entry) : null,
    statuses: watchlistService.STATUSES,
    reviews: reviewItems,
    userReview: reviewItems.find((review) => review.isOwn) || null,
  });
}

// GET /api/movies/search?q=... (JSON, used by the favourite-movie picker on /settings)
async function apiSearchMovies(req, res) {
  const query = String(req.query.q || "").trim().slice(0, 100);
  if (!query) return res.json({ results: [] });

  try {
    const result = await tmdb.searchMovies(query, req.query.page);
    res.json({
      page: result.page,
      totalPages: result.totalPages,
      results: result.movies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        posterPath: movie.poster_path || null,
        releaseYear: movie.release_date ? movie.release_date.slice(0, 4) : null,
      })),
    });
  } catch (error) {
    console.error("TMDB:", error.message);
    res.status(502).json({ error: "Search is temporarily unavailable." });
  }
}

module.exports = {
  getHome,
  discover,
  search,
  movieDetail,
  apiSearchMovies,
};
