const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.get('/signup', (req, res) => res.render('auth/signup', { title: 'Create account', error: null }));
router.post('/signup', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (username.length < 3 || username.length > 30) return res.render('auth/signup', { title: 'Create account', error: 'Username must be between 3 and 30 characters.' });

    if (!/^\S+@\S+\.\S+$/.test(email)) return res.render('auth/signup', { title: 'Create account', error: 'Please enter a valid email.' });

    if (password.length < 8) return res.render('auth/signup', { title: 'Create account', error: 'Password must be at least 8 characters.' });

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) return res.render('auth/signup', { title: 'Create account', error: 'Username or email is already in use.' });

    const passwordHash = await bcrypt.hash(password, 12);
    
    const user = await User.create({ username, email, passwordHash });
    req.session.userId = user._id.toString();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.render('auth/signup', { title: 'Create account', error: 'Could not create your account. Please try again.' });
  }
});

router.get('/login', (req, res) => res.render('auth/login', { title: 'Login', error: null }));
router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.render('auth/login', { title: 'Login', error: 'Email or password is incorrect.' });
    }
    req.session.userId = user._id.toString();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.render('auth/login', { title: 'Login', error: 'Login failed. Please try again.' });
  }
});

router.post('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));
module.exports = router;
