const BASE_URL = 'https://api.themoviedb.org/3';

async function tmdbRequest(endpoint) {
  if (!process.env.ACCESS_TOKEN) throw new Error('TMDB token is not configured');
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}`, Accept: 'application/json' }
  });
  if (!response.ok) throw new Error(`TMDB returned HTTP ${response.status}`);
  return response.json();
}

module.exports = { tmdbRequest };
