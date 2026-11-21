require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const connectDB = require('./config/database');
const User = require('./models/User');
const homeRoutes = require('./routes/homeRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}));

app.use(async (req, res, next) => {
  res.locals.currentUser = null;
  try { if (req.session.userId) res.locals.currentUser = await User.findById(req.session.userId).select('username'); }
  catch (e) { console.error(e); }
  next();
});
app.use(homeRoutes);
app.use(authRoutes);
app.use((req, res) => res.status(404).render('404', { title: 'Not found' }));

async function start() {
  if (!process.env.SESSION_SECRET || !process.env.MONGODB_URI) throw new Error('Set MONGODB_URI and SESSION_SECRET in .env');
  await connectDB();
  app.listen(process.env.PORT || 3000, () => console.log(`CineList running at http://localhost:${process.env.PORT || 3000}`));
}
start().catch(err => { console.error(err); process.exit(1); });
