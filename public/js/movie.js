
document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".cine-movie-page");

    if (!page) return;

    const movieId = Number(page.dataset.movieId);

    const addToListButton = document.getElementById("cine-add-to-list");
    const listMessage = document.getElementById("cine-list-message");

    const scoreDisplay = document.getElementById("cine-user-score");
    const ratingButtons = document.querySelectorAll(".cine-rating-option");
    const ratingMessage = document.getElementById("cine-rating-message");
    const removeRatingButton = document.getElementById("cine-remove-rating");

    let entry = null;
    let busy = false;

    async function apiRequest(url, options = {}) {
        const response = await fetch(url, {
            credentials: "same-origin",
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong.");
        }

        return data;
    }

    function showRatingMessage(message) {
        if (ratingMessage) {
            ratingMessage.textContent = message;
        }
    }

    function showListMessage(message) {
        if (listMessage) {
            listMessage.textContent = message;
        }
    }

    function renderRating() {
        scoreDisplay.textContent = entry?.score ?? "—";

        ratingButtons.forEach((button) => {
            const selected = entry &&
                Number(button.dataset.score) === entry.score;

            button.classList.toggle("is-selected", Boolean(selected));
            button.setAttribute("aria-pressed", String(Boolean(selected)));
        });

        if (removeRatingButton) {
            removeRatingButton.hidden = !entry || entry.score == null;
        }

        if (addToListButton) {
            if (entry) {
                addToListButton.textContent = "✓ Already in your list";
                addToListButton.disabled = true;
            } else {
                addToListButton.textContent = "+ Add to your list";
                addToListButton.disabled = false;
            }
        }
    }

    async function loadUserEntry() {
        try {
            const data = await apiRequest("/api/list");

            entry = data.entries.find(
                (item) => Number(item.movieId) === movieId
            ) || null;

            renderRating();
        } catch (error) {
            showRatingMessage(error.message);
        }
    }

    async function addToList() {
        if (busy || entry || !addToListButton) return;

        busy = true;
        addToListButton.disabled = true;

        showListMessage("Adding to your list...");

        try {
            entry = await apiRequest("/api/list", {
                method: "POST",
                body: JSON.stringify({
                    movieId
                })
            });

            renderRating();
            showListMessage("This movie is now in your list.");
        } catch (error) {
            showListMessage(error.message);
            addToListButton.disabled = false;
        } finally {
            busy = false;
        }
    }

    async function saveRating(score) {
        if (busy) return;

        busy = true;

        ratingButtons.forEach((button) => {
            button.disabled = true;
        });

        showRatingMessage("Saving your rating...");

        try {
            if (entry) {
                entry = await apiRequest(`/api/list/${movieId}`, {
                    method: "PUT",
                    body: JSON.stringify({
                        score
                    })
                });
            } else {
                entry = await apiRequest("/api/list", {
                    method: "POST",
                    body: JSON.stringify({
                        movieId,
                        score
                    })
                });
            }

            renderRating();
            showRatingMessage("Your rating has been saved.");
        } catch (error) {
            showRatingMessage(error.message);
        } finally {
            busy = false;

            ratingButtons.forEach((button) => {
                button.disabled = false;
            });
        }
    }

    async function removeRating() {
        if (!entry || entry.score == null || busy) return;

        busy = true;

        removeRatingButton.disabled = true;

        showRatingMessage("Removing your rating...");

        try {
            await apiRequest(`/api/list/${movieId}/score`, {
                method: "DELETE"
            });

            entry.score = undefined;

            renderRating();
            showRatingMessage("Your rating has been removed.");
        } catch (error) {
            showRatingMessage(error.message);
        } finally {
            busy = false;
            removeRatingButton.disabled = false;
        }
    }

    if (addToListButton) {
        addToListButton.addEventListener("click", addToList);
    }

    ratingButtons.forEach((button) => {
        button.addEventListener("click", () => {
            saveRating(Number(button.dataset.score));
        });
    });

    if (removeRatingButton) {
        removeRatingButton.addEventListener("click", removeRating);
    }

    loadUserEntry();
});
