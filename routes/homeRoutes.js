const express = require('express');
const router = express.Router();
const { tmdbRequest } = require('../services/tmdb');

router.get('/', async (req, res) => {
  try {
    const data = await tmdbRequest('/movie/popular');
    res.render('home', { title: 'CineList', movies: data.results || [], tmdbError: null });
  } catch (error) {
    console.error(error.message);
    res.render('home', { title: 'CineList', movies: [], tmdbError: 'Movie data is temporarily unavailable. Check your TMDB configuration.' });
  }
});

router.get('/search', async (req, res) => {
  const query = String(req.query.q || '').trim();
  if (!query) return res.redirect('/');
  try {
    const data = await tmdbRequest(`/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`);
    res.render('search', { title: `Search: ${query}`, query, movies: data.results || [] });
  } catch (error) {
    console.error(error.message);
    res.render('search', { title: 'Search', query, movies: [], tmdbError: 'Search is temporarily unavailable.' });
  }
});

module.exports = router;
