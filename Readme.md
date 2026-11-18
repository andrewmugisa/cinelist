# CineList

## Getting Started

1. Rename `.env.example` to `.env`.
2. Open `.env` and update the authorisation token with your own.
3. From the `cinelist` folder, start the Node server:

   ```bash
   node .
   ```

4. Visit [http://localhost:3000/](http://localhost:3000/). The app should load.

## Troubleshooting

**`Something went wrong. Status: 401`**

The authorisation token in `.env` is missing or incorrect. Fix the token, then stop the server (Ctrl+C) and run `node .` again, since `.env` is only read at startup.


```
cinelist/
│
├── node_modules/                 # Contains installed npm packages and dependencies.
│
├── public/                       # Contains static frontend files served to the browser.
│   ├── css/
│   │   └── style.css             # Contains the styling and visual design of the application.
│   ├── js/
│   │   └── script.js             # Handles frontend interactions and communication with the backend.
│   ├── images/                   # Stores images, icons, and other visual assets.
│   └── index.html                # Main HTML page displayed to users.
│
├── src/                          # Contains the backend application source code.
│   ├── config/
│   │   └── db.js                 # Handles the connection between the application and MongoDB.
│   │
│   ├── models/
│   │   └── Movie.js              # Defines the Mongoose schema and structure for movie documents.
│   │
│   ├── controllers/
│   │   └── movieController.js    # Handles incoming movie requests and processes responses.
│   │
│   ├── routes/
│   │   └── movieRoutes.js        # Defines the API endpoints related to movies.
│   │
│   ├── services/
│   │   └── tmdbService.js        # Handles requests to The Movie Database (TMDB) API.
│   │
│   └── middleware/
│       └── errorMiddleware.js   # Handles and manages application errors and HTTP error responses.
│
├── .env                          # Stores environment variables and sensitive configuration values.
├── .env.example                  # Provides a template of the required environment variables.
├── .gitignore                    # Specifies files and folders that Git should ignore.
├── index.js                      # Main entry point that configures and starts the Express server.
├── package.json                  # Contains project metadata, npm scripts, and dependency information.
├── package-lock.json             # Locks dependency versions to ensure consistent installations.
└── Readme.md                     # Documents the project, its setup instructions, and folder structure.
```