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