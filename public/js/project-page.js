let galleryData = []; // Array global para almacenar las imágenes y su información
let currentImageIndex = -1; // Índice de la imagen actual en la galería

// Función para cargar los detalles del proyecto
async function loadProjectDetails() {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const projectId = pathParts[1];

    try {
        const response = await fetch('/api/project', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: projectId })
        });

        if (!response.ok) throw new Error(`Error: ${response.statusText}`);

        const data = await response.json();

        console.log('Data received:', data);

        // Actualizar título y descripción del proyecto
        document.getElementById('project-title').textContent = data.name;
        document.getElementById('project-description').innerHTML = data.description;

        const dropdownContainer = document.getElementById('dropdowns');

        // Procesar y almacenar imágenes de photography
        if (data.photography) {
            data.photography.forEach(photo => {
                galleryData.push({
                    url: photo.url,
                    name: photo.name,
                    size: photo.size,
                    date: photo.date,
                    color: photo.color
                });
            });
            createDropdown(dropdownContainer, 'Photography', data.photography, galleryData.length - data.photography.length);
        }

        // Procesar y almacenar imágenes de cada exhibition
        if (data.exhibitions && Array.isArray(data.exhibitions)) {
            data.exhibitions.forEach((exhibition, index) => {
                const startIndex = galleryData.length; // Índice inicial en galleryData
                exhibition.photography.forEach(url => {
                    galleryData.push({
                        url,
                        name: exhibition.name,
                        exhibitionDate: exhibition.date,
                        exhibitionLocation: exhibition.location,
                        curator: exhibition.curator,
                        assistant: exhibition.assistant,
                        size: "",
                        date: "",
                        color: ""
                    });
                });

                createDropdown(
                    dropdownContainer,
                    `Exhibition`,
                    exhibition.photography,
                    startIndex
                );
            });
        }

        // Procesar y crear dropdown para press
        if (data.press && data.press.length > 0) {
            createPressDropdown(dropdownContainer, 'Press', data.press);
        }

    } catch (error) {
        console.error('Error loading project details:', error);
    }
}

// Función para crear un dropdown con enlaces de prensa
function createPressDropdown(container, title, pressItems) {
    const dropdown = document.createElement('div');
    dropdown.classList.add('dropdown-container');

    const dropdownTitle = document.createElement('div');
    dropdownTitle.classList.add('dropdown-title');
    dropdownTitle.textContent = title;

    const dropdownArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    dropdownArrow.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    dropdownArrow.setAttribute("width", "16");
    dropdownArrow.setAttribute("height", "17");
    dropdownArrow.setAttribute("viewBox", "0 0 16 17");
    dropdownArrow.innerHTML = `
          <path d="M7.33782 15.7437C7.72834 16.1343 8.36151 16.1343 8.75203 15.7437L15.116 9.37977C15.5065 8.98924 15.5065 8.35608 15.116 7.96555C14.7255 7.57503 14.0923 7.57503 13.7018 7.96555L8.04492 13.6224L2.38807 7.96555C1.99754 7.57503 1.36438 7.57503 0.973854 7.96555C0.58333 8.35608 0.58333 8.98924 0.973854 9.37977L7.33782 15.7437ZM7.04492 0.0102539L7.04492 15.0366L9.04492 15.0366L9.04492 0.0102539L7.04492 0.0102539Z" fill="black"/>
      `;
    dropdownArrow.style.display = "none"; // Ocultar por defecto
    dropdownArrow.classList.add("arrow");

    const dropdownContent = document.createElement('div');
    dropdownContent.classList.add('dropdown-content');
    dropdownContent.classList.add("press");
    pressItems.forEach(item => {
        const pressItem = document.createElement('div');
        pressItem.classList.add('press-item');

        const link = document.createElement('a');
        link.href = item.link;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = item.text;

        const date = document.createElement('p');
        date.classList.add('press-date');
        date.textContent = item.date;

        pressItem.appendChild(link);
        pressItem.appendChild(date);
        dropdownContent.appendChild(pressItem);
    });

    dropdownTitle.addEventListener('click', () => {

        dropdownContent.classList.toggle('dropdown-content-visible');
        if (dropdownContent.classList.contains('dropdown-content-visible')) {
            dropdownArrow.style.display = "block";

        } else {
            dropdownArrow.style.display = "none";
        }
    });


    const dropdownTitleContaniner = document.createElement('div');
    dropdownTitleContaniner.classList.add('dropdownTitleContaniner');
    dropdownTitleContaniner.appendChild(dropdownTitle);
    dropdownTitleContaniner.appendChild(dropdownArrow);
    dropdown.appendChild(dropdownTitleContaniner);
    dropdown.appendChild(dropdownContent);
    container.appendChild(dropdown);

}

// Función para crear un dropdown con imágenes
// Función para inicializar el dropdown
function createDropdown(container, title, images, startIndex) {

    const dropdown = document.createElement('div');
    dropdown.classList.add('dropdown-container');

    const dropdownTitle = document.createElement('div');
    dropdownTitle.classList.add('dropdown-title');
    dropdownTitle.textContent = title;

    const dropdownContent = document.createElement('div');
    dropdownContent.classList.add('dropdown-content');



    // Crear el SVG y ocultarlo inicialmente
    const dropdownArrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    dropdownArrow.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    dropdownArrow.setAttribute("width", "16");
    dropdownArrow.setAttribute("height", "17");
    dropdownArrow.setAttribute("viewBox", "0 0 16 17");
    dropdownArrow.innerHTML = `
          <path d="M7.33782 15.7437C7.72834 16.1343 8.36151 16.1343 8.75203 15.7437L15.116 9.37977C15.5065 8.98924 15.5065 8.35608 15.116 7.96555C14.7255 7.57503 14.0923 7.57503 13.7018 7.96555L8.04492 13.6224L2.38807 7.96555C1.99754 7.57503 1.36438 7.57503 0.973854 7.96555C0.58333 8.35608 0.58333 8.98924 0.973854 9.37977L7.33782 15.7437ZM7.04492 0.0102539L7.04492 15.0366L9.04492 15.0366L9.04492 0.0102539L7.04492 0.0102539Z" fill="black"/>
      `;
    dropdownArrow.style.display = "none"; // Ocultar por defecto
    dropdownArrow.classList.add("arrow");
    let currentIndex = 0; // Índice actual de la imagen mostrada

    // Crear la navegación
    const navigationContainer = document.createElement('div');
    navigationContainer.classList.add('dropdown-nav');

    const leftArea = document.createElement('div');
    leftArea.classList.add('nav-left');
    const rightArea = document.createElement('div');
    rightArea.classList.add('nav-right');

    // Función para actualizar la imagen mostrada
    function updateImage() {
        dropdownContent.innerHTML = ''; // Limpiar contenido
        const img = document.createElement('img');
        img.src = images[currentIndex].url || images[currentIndex];
        img.alt = images[currentIndex].name || title;

        if (title === "Exhibition") {
            img.classList.add('exhibition-image');

        } else {

            img.classList.add('dropdown-image');

        }
        // Hacer clic en la imagen abre la galería
        img.addEventListener('click', () => openGallery(startIndex + currentIndex));

        dropdownContent.appendChild(img);
        dropdownContent.appendChild(navigationContainer); // Añadir navegación a dropdown-content
    }

    // Navegar hacia atrás
    // Navegar hacia atrás
    leftArea.addEventListener('click', (event) => {
        event.stopPropagation(); // Detener propagación para evitar clic en la imagen
        if (currentIndex > 0) {
            currentIndex--;
            updateImage();
        }
    });

    // Navegar hacia adelante
    rightArea.addEventListener('click', (event) => {
        event.stopPropagation(); // Detener propagación para evitar clic en la imagen
        if (currentIndex < images.length - 1) {
            currentIndex++;
            updateImage();
        }
    });

    const dropdownTitleContaniner = document.createElement('div');
    // Función para ajustar la vista del dropdown
    function adjustDropdownView() {
        const isResponsive = window.innerWidth <= 400;

        if (isResponsive) {
            navigationContainer.style.display = 'flex'; // Mostrar navegación en responsivo
            updateImage();
        } else {
            dropdownContent.innerHTML = ''; // Limpiar contenido
            if (title === "Exhibition") {
                const exhibitionInfo = document.createElement('div');
                exhibitionInfo.classList.add('exhibition-info');
                exhibitionInfo.style.position = "absolute";
                // Obtener datos de la primera imagen asociada con la exhibición
                const exhibitionData = galleryData[startIndex];

                // Añadir la información de la exhibition
                exhibitionInfo.innerHTML = `
                <span style="display:inline-block;margin-right:24px;">${exhibitionData.name}</span>
                <span>${exhibitionData.exhibitionLocation},</span>
                <span>${exhibitionData.exhibitionDate}</span>
            `;
                dropdownContent.appendChild(exhibitionInfo);
            }
            images.forEach((image, index) => {
                const img = document.createElement('img');
                img.src = image.url || image;
                img.alt = image.name || title;

                if (title === "Exhibition") {
                    img.classList.add('exhibition-image');

                } else {

                    img.classList.add('dropdown-image');

                }
                // Abrir galería al clic
                img.addEventListener('click', () => openGallery(startIndex + index));

                dropdownContent.appendChild(img);
            });
            navigationContainer.style.display = 'none'; // Ocultar navegación
        }


    }

    // Añadir las áreas clicables a la navegación
    navigationContainer.appendChild(leftArea);
    navigationContainer.appendChild(rightArea);

    dropdownTitle.addEventListener('click', () => {
        dropdownContent.classList.toggle('dropdown-content-visible');
        navigationContainer.style.display = dropdownContent.classList.contains('dropdown-content-visible') && window.innerWidth <= 400 ? 'flex' : 'none';

        if (dropdownContent.classList.contains('dropdown-content-visible')) {
            dropdownArrow.style.display = "block";

        } else {
            dropdownArrow.style.display = "none";

        }
    });


    if (title == `Exhibition`) {

        const exhibitionInfo = document.createElement('div');
        exhibitionInfo.innerHTML = `<span>${galleryData[startIndex].name}</span>`;
        dropdownContent.appendChild(exhibitionInfo);
    }

    dropdownTitleContaniner.classList.add('dropdownTitleContaniner');
    dropdownTitleContaniner.appendChild(dropdownTitle);
    dropdownTitleContaniner.appendChild(dropdownArrow);
    dropdown.appendChild(dropdownTitleContaniner);
    dropdown.appendChild(dropdownContent);
    container.appendChild(dropdown);

    // Inicializar vista al cargar
    adjustDropdownView();

    // Ajustar la vista al cambiar el tamaño de la pantalla
    window.addEventListener('resize', adjustDropdownView);
}

// Función para abrir la galería
function openGallery(startIndex) {
    currentImageIndex = startIndex;
    const gallery = document.getElementById('gallery');
    const otherContent = document.querySelectorAll('#content > :not(#gallery)'); // Seleccionar todo excepto la galería

    // Ocultar todo excepto la galería
    otherContent.forEach(el => el.classList.add('hidden'));

    gallery.style.display = 'flex'; // Mostrar la galería
    updateGallery();
}

function updateGallery() {
    if (currentImageIndex < 0 || currentImageIndex >= galleryData.length) {
        closeGallery();
        return;
    }

    const galleryImage = document.getElementById('gallery-image');
    const galleryInfo = document.getElementById('gallery-info');

    const currentData = galleryData[currentImageIndex];

    // Actualizar imagen
    galleryImage.src = currentData.url;

    // Construir la información de la galería dinámicamente
    document.getElementById('gallery-name').textContent = currentData.name;

    // Mostrar datos específicos de la exhibición (si existen)
    if (currentData.exhibitionDate) {
        document.getElementById('gallery-date').textContent = currentData.exhibitionLocation + ", " + currentData.exhibitionDate;
        document.getElementById('gallery-info1').textContent = currentData.curator;
        document.getElementById('gallery-info2').textContent = currentData.assistant;
    } else {
        if (currentData.date) {
            document.getElementById('gallery-date').textContent = currentData.date;
        }
        if (currentData.size) {
            document.getElementById('gallery-info1').textContent = currentData.size;
        }
        if (currentData.color) {
            document.getElementById('gallery-info2').textContent = currentData.color;
        }

    }
}

// Función para cerrar la galería
function closeGallery() {
    const gallery = document.getElementById('gallery');
    const otherContent = document.querySelectorAll('#content > :not(#gallery)'); // Seleccionar todo excepto la galería

    // Mostrar todo lo demás
    otherContent.forEach(el => el.classList.remove('hidden'));

    gallery.style.display = 'none'; // Ocultar la galería
    currentImageIndex = -1; // Reiniciar índice
}

// Navegación por clic en los lados
document.getElementById('gallery').addEventListener('click', event => {
    const clickX = event.clientX;
    const windowWidth = window.innerWidth;

    if (clickX < windowWidth * 0.25) {
        // Clic en el lado izquierdo
        if (currentImageIndex === 0) {
            closeGallery(); // Cerrar galería al inicio
        } else {
            currentImageIndex--;
            updateGallery();
        }
    } else if (clickX > windowWidth * 0.75) {
        // Clic en el lado derecho
        if (currentImageIndex === galleryData.length - 1) {
            closeGallery(); // Cerrar galería al final
        } else {
            currentImageIndex++;
            updateGallery();
        }
    }
});

// Cargar detalles del proyecto al inicio
loadProjectDetails();
