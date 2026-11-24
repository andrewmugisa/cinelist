# CineList

## Getting Started

1. Rename `.env.example` to `.env`.
2. Open `.env` and update the authorisation token with your own.
3. Generate a random session-key and replace it with the placeholder.
3. From the `cinelist` folder, start the Node server:
   npm start 
   Use: npm run dev - for auto update node server, liveserver like experience

4. Visit [http://localhost:3000/](http://localhost:3000/). The app should load.

## Troubleshooting

**`Something went wrong. Status: 401`**

The authorisation token in `.env` is missing or incorrect. Fix the token, then stop the server (Ctrl+C) and run `node .` again, since `.env` is only read at startup.


```
Folder Structure

CineList/
│
├── app.js   //m ain app
├── package.json
├── .env
├── .gitignore
│
├── config/
│   └── database.js   //don't have it rn
│
├── models/
│   ├── User.js
│   ├── Movie.js
│   ├── WatchlistEntry.js
│   └── Review.js
│
├── routes/
│   ├── authRoutes.js
│   ├── movieRoutes.js
│   ├── watchlistRoutes.js
│   ├── reviewRoutes.js
│   └── profileRoutes.js
│
├── controllers/
│   ├── authController.js
│   ├── movieController.js
│   ├── watchlistController.js
│   ├── reviewController.js
│   └── profileController.js
│
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
│
├── views/
│   ├── layouts/
│   │   └── main.pug
│   │
│   ├── partials/
│   │   ├── navbar.pug
│   │   └── footer.pug
│   │
│   ├── home.pug
│   ├── movies/
│   │   ├── index.pug
│   │   └── show.pug
│   │
│   ├── auth/
│   │   ├── login.pug
│   │   └── register.pug
│   │
│   ├── watchlist/
│   │   └── index.pug
│   │
│   ├── profiles/
│   │   └── show.pug
│   │
│   └── reviews/
│       └── show.pug
│
├── public/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── images/
│
└── data/
    └── seedMovies.js
