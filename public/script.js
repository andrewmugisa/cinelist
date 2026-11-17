const container = document.getElementById("home");

const url = "http://localhost:3000/api/movies";

async function discoverMovies() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      const imageUrl = `https://image.tmdb.org/t/p/w500${data.poster_path}`;

      container.innerHTML = `
        <div class="movie-card">
          <img src="${imageUrl}" alt="${data.title}">
          <h3>${data.title}</h3>
          <p>${data.overview}</p>
          <p>Rating: ${data.vote_average}</p>
        </div>
      `;
      console.log(data);
    } else {
      console.error("Something went wrong:", data);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
}

async function discoverMovies2() {
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      container.innerHTML = "";

      for (const movie of data.results) {
        const imageUrl = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

        container.innerHTML += `
          <div class="movie-card">
            <img src="${imageUrl}" alt="${movie.title}">
            <div>
                <h3>${movie.title}</h3>
                <p>${movie.overview}</p>
                <p>Rating: ${movie.vote_average}</p>
            </div>
          </div>
        `;
      }

      console.log(data);
    } else {
      console.error("Something went wrong:", data);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
}

discoverMovies2();
