document.addEventListener("DOMContentLoaded", () => {
    const carousels = document.querySelectorAll(".cine-section");

    carousels.forEach((section) => {
        const track = section.querySelector("[data-carousel-track]");
        const previousButton = section.querySelector("[data-carousel-prev]");
        const nextButton = section.querySelector("[data-carousel-next]");

        if (!track || !previousButton || !nextButton) return;

        function updateButtons() {
            const atStart = track.scrollLeft <= 1;
            const atEnd =
                track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;

            previousButton.disabled = atStart;
            nextButton.disabled = atEnd;
        }

        function moveCarousel(direction) {
            const firstCard = track.querySelector(".cine-movie-card");

            if (!firstCard) return;

            const cardWidth = firstCard.getBoundingClientRect().width;
            const styles = window.getComputedStyle(track);
            const gap = parseFloat(styles.columnGap) || 0;

            const distance = (cardWidth + gap) * 5;

            track.scrollBy({
                left: direction * distance,
                behavior: "smooth",
            });
        }

        previousButton.addEventListener("click", () => {
            moveCarousel(-1);
        });

        nextButton.addEventListener("click", () => {
            moveCarousel(1);
        });

        track.addEventListener("scroll", updateButtons, { passive: true });

        window.addEventListener("resize", updateButtons);

        updateButtons();
    });
});