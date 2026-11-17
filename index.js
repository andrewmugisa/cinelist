const express = require("express");
require("dotenv").config();
const app = express();

BASE_URL = "https://api.themoviedb.org/3/";
app.get("/", (request, response) => {
  response.send("hello, first node api here\n" + process.env.test);
});

function discoverMovies() {}

app.listen(process.env.PORT || 3000, () =>
  console.log(`App available on http://localhost:3000/`),
);
