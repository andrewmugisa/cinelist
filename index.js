const express = require("express");
require("dotenv").config();

const app = express();

const url =
  "https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc";
const token = process.env.ACCESS_TOKEN;

app.use(express.static("public"));

app.get("/api/movies", async (request, response) => {
  response.json(await discoverMovies());
});

async function discoverMovies() {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      console.error("Something went wrong. Status:", response.status);
      return data;
    }
  } catch (error) {
    console.error("Network or parsing error:", error);
  }
}

app.listen(process.env.PORT || 3000, () =>
  console.log(`App available on http://localhost:3000/`),
);
