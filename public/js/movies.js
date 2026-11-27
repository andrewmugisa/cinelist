
document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".cine-movie-page");
    if (!page) return;

    const movieId = Number(page.dataset.movieId);

    const addButton = document.getElementById("cine-add-to-list");
    const listControls = document.getElementById("cine-list-controls");
    const statusSelect = document.getElementById("cine-movie-status");
    const removeButton = document.getElementById("cine-remove-from-list");

    const scoreDisplay = document.getElementById("cine-user-score");
    const ratingButtons = document.querySelectorAll(".cine-rating-option");

    const listMessage = document.getElementById("cine-list-message");
    const ratingMessage = document.getElementById("cine-rating-message");

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
            throw new Error(data.error || "Request failed.");
        }

        return data;
    }

    function showMessage(element, message) {
        if (element) element.textContent = message;
    }

    function renderEntry() {
        const hasEntry = Boolean(entry);

        addButton.hidden = hasEntry;
        listControls.hidden = !hasEntry;

        if (hasEntry) {
            statusSelect.value = entry.status;
            scoreDisplay.textContent = entry.score ?? "—";
        } else {
            scoreDisplay.textContent = "—";
        }

        ratingButtons.forEach((button) => {
            const selected = hasEntry &&
                Number(button.dataset.score) === entry.score;

            button.classList.toggle("is-selected", selected);
            button.setAttribute("aria-pressed", String(selected));
        });
    }

    async function loadEntry() {
        try {
            const data = await apiRequest("/api/list");

            entry = data.entries.find(
                (item) => Number(item.movieId) === movieId
            ) || null;

            renderEntry();
        } catch (error) {
            showMessage(listMessage, error.message);
        }
    }

    async function addToList() {
        if (busy || entry) return;

        busy = true;
        addButton.disabled = true;
        showMessage(listMessage, "Adding to your list...");

        try {
            entry = await apiRequest("/api/list", {
                method: "POST",
                body: JSON.stringify({ movieId })
            });

            renderEntry();
            showMessage(listMessage, "Added to your list.");
        } catch (error) {
            showMessage(listMessage, error.message);
        } finally {
            busy = false;
            addButton.disabled = Boolean(entry);
        }
    }

    async function updateEntry(changes) {
        return apiRequest(`/api/list/${movieId}`, {
            method: "PUT",
            body: JSON.stringify(changes)
        });
    }

    async function updateStatus(status) {
        if (!entry || busy) return;

        const previousStatus = entry.status;

        busy = true;
        statusSelect.disabled = true;
        showMessage(listMessage, "Updating status...");

        try {
            entry = await updateEntry({ status });
            renderEntry();
            showMessage(listMessage, "Status updated.");
        } catch (error) {
            statusSelect.value = previousStatus;
            showMessage(listMessage, error.message);
        } finally {
            busy = false;
            statusSelect.disabled = false;
        }
    }

    async function updateScore(score) {
        if (busy) return;

        busy = true;

        ratingButtons.forEach((button) => {
            button.disabled = true;
        });

        showMessage(ratingMessage, "Saving rating...");

        try {
            if (entry) {
                entry = await updateEntry({ score });
            } else {
                entry = await apiRequest("/api/list", {
                    method: "POST",
                    body: JSON.stringify({ movieId, score })
                });
            }

            renderEntry();
            showMessage(ratingMessage, `Your rating: ${score}/10`);
        } catch (error) {
            showMessage(ratingMessage, error.message);
        } finally {
            busy = false;

            ratingButtons.forEach((button) => {
                button.disabled = false;
            });
        }
    }

    async function removeFromList() {
        if (!entry || busy) return;

        busy = true;
        removeButton.disabled = true;
        showMessage(listMessage, "Removing from your list...");

        try {
            await apiRequest(`/api/list/${movieId}`, {
                method: "DELETE"
            });

            entry = null;
            renderEntry();

            showMessage(listMessage, "Removed from your list.");
            showMessage(ratingMessage, "Your personal list rating was removed.");
        } catch (error) {
            showMessage(listMessage, error.message);
        } finally {
            busy = false;
            removeButton.disabled = false;
        }
    }

    addButton.addEventListener("click", addToList);

    statusSelect.addEventListener("change", () => {
        updateStatus(statusSelect.value);
    });

    removeButton.addEventListener("click", removeFromList);

    ratingButtons.forEach((button) => {
        button.addEventListener("click", () => {
            updateScore(Number(button.dataset.score));
        });
    });

    loadEntry();
});
