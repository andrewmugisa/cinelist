/**
 * All requests to The Movie Database (TMDB) API live in this file.
 */
const BASE_URL = "https://api.themoviedb.org/3";
const REQUEST_TIMEOUT_MS = 8000;

// TMDB never returns more than 500 pages for list endpoints.
const MAX_TMDB_PAGE = 500;

// URL slug -> TMDB endpoint and page heading.
const CATEGORIES = {
  popular: { endpoint: "/movie/popular", heading: "Popular Movies" },
  "top-rated": { endpoint: "/movie/top_rated", heading: "Highest Rated" },
  upcoming: { endpoint: "/movie/upcoming", heading: "Top Upcoming" },
  "now-playing": { endpoint: "/movie/now_playing", heading: "Now Playing" },
};

async function tmdbRequest(endpoint, params = {}) {
  if (!process.env.ACCESS_TOKEN) {
    throw new Error("TMDB token is not configured");
  }

  const url = new URL(BASE_URL + endpoint);
  const query = { language: "en-US", ...params };
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const error = new Error(`TMDB returned HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function clampPage(page) {
  const number = Number.parseInt(page, 10);
  if (!Number.isInteger(number) || number < 1) return 1;
  return Math.min(number, MAX_TMDB_PAGE);
}

// Normalises a TMDB paged response.
function toPagedResult(data, page) {
  const totalPages = Math.min(data.total_pages || 1, MAX_TMDB_PAGE);
  return {
    movies: data.results || [],
    page,
    totalPages,
    totalResults: data.total_results || 0,
    hasNextPage: page < totalPages,
  };
}

function isValidCategory(category) {
  return Object.prototype.hasOwnProperty.call(CATEGORIES, category);
}

async function getMovieCategory(category, page = 1) {
  if (!isValidCategory(category)) {
    const error = new Error(`Unknown movie category: ${category}`);
    error.status = 404;
    throw error;
  }
  const currentPage = clampPage(page);
  const data = await tmdbRequest(CATEGORIES[category].endpoint, {
    page: currentPage,
  });
  return toPagedResult(data, currentPage);
}

const getPopularMovies = (page) => getMovieCategory("popular", page);
const getTopRatedMovies = (page) => getMovieCategory("top-rated", page);
const getUpcomingMovies = (page) => getMovieCategory("upcoming", page);
const getNowPlayingMovies = (page) => getMovieCategory("now-playing", page);

async function searchMovies(query, page = 1) {
  const currentPage = clampPage(page);
  const data = await tmdbRequest("/search/movie", {
    query,
    page: currentPage,
    include_adult: false,
  });
  return toPagedResult(data, currentPage);
}

// Full details for one movie, including cast/crew and trailers.
async function getMovieDetails(movieId) {
  return tmdbRequest(`/movie/${movieId}`, {
    append_to_response: "credits,videos",
  });
}

// The few fields we cache in MongoDB alongside a TMDB movie ID.
function toMovieSummary(movie) {
  return {
    movieId: movie.id,
    title: movie.title || "Untitled movie",
    posterPath: movie.poster_path || null,
    releaseDate: movie.release_date || null,
  };
}

module.exports = {
  CATEGORIES,
  tmdbRequest,
  isValidCategory,
  getMovieCategory,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
  searchMovies,
  getMovieDetails,
  toMovieSummary,
};
