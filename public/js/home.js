var currentIndex = 0;
var images = [];
var preloadedImages = {};

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

        // Precarga las primeras imágenes necesarias para mostrar inmediatamente
        await preloadInitialImages(3);

        // Muestra la primera imagen
        updateDisplay();

        // Precarga las imágenes restantes en segundo plano
        preloadRemainingImages();
    } catch (error) {
        console.error('Error loading images:', error);
    }
}


async function preloadInitialImages(count) {
    const promises = images.slice(0, count).map((image) => preloadImage(image.url));
    await Promise.all(promises);
}

function preloadRemainingImages() {
    images.slice(3).forEach((image) => preloadImage(image.url));
}

function preloadImage(url) {
    return new Promise((resolve) => {
        if (preloadedImages[url]) {
            resolve(); // Ya está precargada
            return;
        }

        const img = new Image();
        img.src = url;
        img.onload = () => {
            preloadedImages[url] = true; // Marcar como precargada
            resolve();
        };
        img.onerror = () => {
            console.warn(`Failed to preload image: ${url}`);
            resolve();
        };
    });
}

function updateDisplay() {
    const homeImageContainer = document.getElementById('home-image-container');
    const numbering = document.querySelector('.homepage-numbering');
    const info = document.querySelector('.homepage-info');

    if (images.length > 0) {
        const currentImage = images[currentIndex];
        const imgElement = homeImageContainer.querySelector('img');

        // Precargar la imagen actual antes de actualizar el src
        const tempImage = new Image();
        tempImage.src = currentImage.url;

        tempImage.onload = () => {
            imgElement.src = currentImage.url;
            imgElement.classList.add('loaded'); // Añade una clase para la transición

            numbering.textContent = String(currentIndex + 1).padStart(3, '0');
            info.textContent = `${currentImage.name}, ${currentImage.date}`;
        };
    }
}

function showPreviousImage() {
    if (images.length > 0) {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateDisplay();
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
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
    homeImageContainer.addEventListener('click', (event) => {
        event.preventDefault();
        const rect = homeImageContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;

        if (clickX < rect.width / 2) {
            showPreviousImage();
        } else {
            showNextImage();
        }
    });
}

function handleResponsiveNavigation() {
    const isMobile = window.matchMedia('(max-width: 700px)').matches;

    if (isMobile && (location.pathname === '/' || location.pathname === '/home')) {
        navigateTo('work');
    }
}

document.getElementById('home-image-container').addEventListener('mousemove', (event) => {
    const cursor = document.getElementById('custom-cursor');
    const galleryImage = document.getElementById('home-img');
    const rect = galleryImage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;


    // Mostrar el cursor dinámico y ocultar el cursor predeterminado
    cursor.style.display = 'block';
    cursor.style.left = `${event.pageX}px`;
    cursor.style.top = `${event.pageY}px`;

    if (event.clientX < centerX) {
        cursor.textContent = 'prev';
    } else {
        cursor.textContent = 'next';
    }

});


document.getElementById('home-image-container').addEventListener('mouseleave', () => {
    const cursor = document.getElementById('custom-cursor');
    cursor.style.display = 'none'; // Ocultar el cursor dinámico
});

document.getElementById('home-image-container').addEventListener('mouseenter', () => {
    const cursor = document.getElementById('custom-cursor');
    cursor.style.display = 'block'; // Mostrar el cursor dinámico
});



window.addEventListener('resize', handleResponsiveNavigation);
handleResponsiveNavigation();

loadImages();
setupClickEvents();
