var currentIndex = 0;
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

async function loadImages() {
    try {
        const response = await fetch('/api/home');

        if (!response.ok) {
            throw new Error('Error loading Images');
        }

        images = await response.json();

        images = shuffleArray(images);

        updateDisplay();
    } catch (error) {
        console.error('Error loading images:', error);
    }
}

function updateDisplay() {
    const homeImageContainer = document.getElementById('home-image-container');
    const numbering = document.querySelector('.homepage-numbering');
    const info = document.querySelector('.homepage-info');

    if (images.length > 0) {
        const currentImage = images[currentIndex];

        homeImageContainer.querySelector('img').src = currentImage.url;

        numbering.textContent = String(currentIndex + 1).padStart(3, '0');

        info.textContent = `${currentImage.name} (${currentImage.date})`;
    }
}

function showPreviousImage() {
    if (images.length > 0) {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateDisplay(); // Actualiza la visualización después de cambiar el índice
    }
}


function showNextImage() {
    if (images.length > 0) {
        currentIndex = (currentIndex + 1) % images.length;
        updateDisplay();
    }
}

function setupClickEvents() {
    const homeImageContainer = document.getElementById('home-image-container');

    homeImageContainer.addEventListener('click', (event) => {
        const rect = homeImageContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        if (clickX < rect.width / 2) {
            showPreviousImage();
        } else {
            showNextImage();
        }
    });
}

loadImages();
setupClickEvents();

function handleResponsiveNavigation() {
    const isMobile = window.matchMedia('(max-width: 700px)').matches;

    if (isMobile && (location.pathname === '/' || location.pathname === '/home')) {
        navigateTo('work');
    }
}

window.addEventListener('resize', handleResponsiveNavigation);

handleResponsiveNavigation();
