
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("profile-settings-form");

    if (!form) return;


    // Image previews
    function setupImagePreview(inputId, previewId, placeholderId, className, alt) {
        const input = document.getElementById(inputId);

        if (!input) return;

        input.addEventListener("change", () => {
            const file = input.files?.[0];

            if (!file) return;

            if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                alert("Please choose a JPG, PNG, or WebP image.");
                input.value = "";
                return;
            }

            const previewUrl = URL.createObjectURL(file);
            let preview = document.getElementById(previewId);

            if (!preview) {
                preview = document.createElement("img");
                preview.id = previewId;
                preview.alt = alt;
                preview.className = className;

                const placeholder = document.getElementById(placeholderId);
                placeholder?.replaceWith(preview);
            }

            preview.src = previewUrl;
        });
    }

    setupImagePreview(
        "profile-picture-input",
        "profile-picture-preview",
        "profile-picture-placeholder",
        "",
        "Selected profile picture"
    );

    setupImagePreview(
        "background-image-input",
        "background-image-preview",
        "background-image-placeholder",
        "",
        "Selected profile background"
    );


    // Favourite Movie Picker
    const picker = document.getElementById("favorite-picker");
    const queryInput = document.getElementById("favorite-movie-query");
    const searchButton = document.getElementById("favorite-movie-search-button");
    const resultsContainer = document.getElementById("favorite-movie-results");
    const message = document.getElementById("favorite-search-message");
    const closeButton = document.getElementById("close-favorite-picker");
    const removeButton = document.getElementById("remove-favorite-button");
    const pickerTitle = document.getElementById("favorite-picker-title");

    let activeSlot = null;

    const slots = document.querySelectorAll("[data-favorite-slot]");

    function getSlotInput(slotNumber) {
        return document.querySelector(
            `[data-favorite-id-slot="${slotNumber}"]`
        );
    }

    function openPicker(slot) {
        activeSlot = slot.dataset.favoriteSlot;

        const isFilled = slot.classList.contains("is-filled");

        pickerTitle.textContent = isFilled
            ? "Replace favourite movie"
            : "Add favourite movie";

        removeButton.hidden = !isFilled;
        queryInput.value = "";
        resultsContainer.replaceChildren();
        message.textContent = "Search for a movie title.";

        picker.hidden = false;
        queryInput.focus();

        picker.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

    slots.forEach((slot) => {
        slot.addEventListener("click", () => openPicker(slot));
    });

    closeButton.addEventListener("click", () => {
        picker.hidden = true;
        activeSlot = null;
    });


    // SEARCH MOVIES
    async function searchMovies() {
        const query = queryInput.value.trim();

        if (!query) {
            message.textContent = "Enter a movie title first.";
            return;
        }

        message.textContent = "Searching...";
        resultsContainer.replaceChildren();

        try {
            const response = await fetch(
                `/api/movies/search?q=${encodeURIComponent(query)}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Movie search failed.");
            }

            if (!data.results?.length) {
                message.textContent = "No movies found.";
                return;
            }

            message.textContent = "Select a movie to add it.";

            data.results.forEach((movie) => {
                const result = document.createElement("button");
                result.type = "button";
                result.className = "cine-favorite-result";

                if (movie.posterPath) {
                    const image = document.createElement("img");
                    image.src =
                        `https://image.tmdb.org/t/p/w342${movie.posterPath}`;
                    image.alt = `${movie.title} poster`;
                    image.loading = "lazy";
                    result.appendChild(image);
                } else {
                    const placeholder = document.createElement("div");
                    placeholder.className = "cine-favorite-result-placeholder";
                    placeholder.textContent = "No poster";
                    result.appendChild(placeholder);
                }

                const title = document.createElement("span");
                title.textContent = movie.releaseYear
                    ? `${movie.title} (${movie.releaseYear})`
                    : movie.title;

                result.appendChild(title);

                result.addEventListener("click", () => selectMovie(movie));

                resultsContainer.appendChild(result);
            });
        } catch (error) {
            message.textContent = error.message || "Could not search movies.";
        }
    }

    searchButton.addEventListener("click", searchMovies);

    queryInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchMovies();
        }
    });


    // SELECT A MOVIE
    function selectMovie(movie) {
        if (!activeSlot) return;

        const duplicate = [...document.querySelectorAll("[data-favorite-id-slot]")]
            .some((input) =>
                input.dataset.favoriteIdSlot !== activeSlot &&
                input.value === String(movie.id)
            );

        if (duplicate) {
            message.textContent = "That movie is already in your favourites.";
            return;
        }

        const slot = document.querySelector(
            `[data-favorite-slot="${activeSlot}"]`
        );

        const hiddenInput = getSlotInput(activeSlot);

        if (!slot || !hiddenInput) return;

        hiddenInput.value = movie.id;

        slot.className = "cine-favorite-slot is-filled";
        slot.replaceChildren();

        if (movie.posterPath) {
            const image = document.createElement("img");
            image.src = `https://image.tmdb.org/t/p/w342${movie.posterPath}`;
            image.alt = `${movie.title} poster`;
            slot.appendChild(image);
        } else {
            const placeholder = document.createElement("span");
            placeholder.className = "cine-favorite-no-poster";
            placeholder.textContent = movie.title;
            slot.appendChild(placeholder);
        }

        const editLabel = document.createElement("span");
        editLabel.className = "cine-favorite-edit";
        editLabel.textContent = "Edit";
        slot.appendChild(editLabel);

        slot.setAttribute("aria-label", `Edit favourite ${activeSlot}: ${movie.title}`);

        const wrapper = slot.closest(".cine-favorite-slot-wrapper");
        let title = wrapper.querySelector(".cine-favorite-title");

        if (!title) {
            title = document.createElement("p");
            title.className = "cine-favorite-title";
            wrapper.appendChild(title);
        }

        title.textContent = movie.title;

        picker.hidden = true;
        activeSlot = null;
    }


    // REMOVE A FAVOURITE
    removeButton.addEventListener("click", () => {
        if (!activeSlot) return;

        const slot = document.querySelector(
            `[data-favorite-slot="${activeSlot}"]`
        );

        const hiddenInput = getSlotInput(activeSlot);

        if (!slot || !hiddenInput) return;

        hiddenInput.value = "";

        slot.className = "cine-favorite-slot is-empty";
        slot.replaceChildren();

        const plus = document.createElement("span");
        plus.className = "cine-favorite-plus";
        plus.textContent = "+";

        const label = document.createElement("span");
        label.textContent = "Add movie";

        slot.append(plus, label);
        slot.setAttribute("aria-label", `Add favourite movie in slot ${activeSlot}`);

        const wrapper = slot.closest(".cine-favorite-slot-wrapper");
        wrapper.querySelector(".cine-favorite-title")?.remove();

        picker.hidden = true;
        activeSlot = null;
    });
});
