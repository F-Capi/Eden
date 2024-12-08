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

                let photos = [];
                exhibition.photography.forEach(photo => {
                    photos.push({
                        url: photo,
                        name: exhibition.name,
                        exhibitionDate: exhibition.date,
                        exhibitionLocation: exhibition.location,
                        curator: exhibition.curator,
                        assistant: exhibition.assistant
                    });
                });

                createDropdown(
                    dropdownContainer,
                    `Exhibition`,
                    photos,
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

    const dropdownArrow = document.createElement("span");

    dropdownArrow.innerHTML = `+`;
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
        const isOpen = dropdownContent.classList.toggle('dropdown-content-visible');

        // Actualizar el texto del título con el símbolo dinámico
        dropdownTitle.textContent = `${isOpen ? '+' : '+'} ${title}`;
    });

    // Agregar hover para mostrar el símbolo `+` al pasar el cursor
    dropdownTitle.addEventListener('mouseover', () => {
        if (!dropdownContent.classList.contains('dropdown-content-visible')) {
            dropdownTitle.textContent = `+ ${title}`; // Mostrar el símbolo en hover
        }
    });

    dropdownTitle.addEventListener('mouseout', () => {
        if (!dropdownContent.classList.contains('dropdown-content-visible')) {
            dropdownTitle.textContent = `${title}`; // Restaurar solo el título
        }
    });

    dropdownTitle.classList.add("hover-effect");


    const dropdownTitleContaniner = document.createElement('div');
    dropdownTitleContaniner.classList.add('dropdownTitleContaniner');
    dropdownTitleContaniner.appendChild(dropdownTitle);
    dropdownTitle.appendChild(dropdownArrow);
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
    dropdownTitle.innerHTML = title;

    const dropdownContent = document.createElement('div');
    dropdownContent.classList.add('dropdown-content');


    const dropdownArrow = document.createElement("span");

    dropdownArrow.innerHTML = `+`;
    dropdownArrow.style.display = "none"; // Ocultar por defecto
    dropdownArrow.classList.add("arrow");


    let currentIndex = 0; // Índice actual de la imagen mostrada

    const infoImagesContainer = document.createElement('div');
    infoImagesContainer.classList.add('infoImagesContainer');
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
            console.log(images);
            infoImagesContainer.innerHTML = `<div id="gallery-top-info"><p id="gallery-name">${images[currentIndex].name}<br> ${images[currentIndex].exhibitionDate}<br> ${images[currentIndex].exhibitionLocation}</p></div>
            <div id="gallery-bottom-info"><p id="gallery-info1">${images[currentIndex].curator}</p><p id="gallery-info2">${images[currentIndex].assistant}</p></div>
              `;

            img.classList.add('exhibition-image');
            const num = document.createElement("p");
            num.classList.add("gallery-number");
            num.innerHTML = `${currentIndex + 1}/${images.length}`;


            dropdownContent.appendChild(infoImagesContainer);
            dropdownContent.appendChild(img);
            dropdownContent.appendChild(navigationContainer);
            dropdownContent.appendChild(num);



        } else {

            infoImagesContainer.innerHTML = `<div id="gallery-top-info"><p id="gallery-name">${images[currentIndex].name} ${images[currentIndex].date}</p></div>
          <div id="gallery-bottom-info"><p id="gallery-info1">${images[currentIndex].size}</p><p id="gallery-info2">${images[currentIndex].color}</p></div>
            `;
            img.classList.add('dropdown-image');

            const num = document.createElement("p");
            num.classList.add("gallery-number");
            num.innerHTML = `${currentIndex + 1}/${images.length}`;


            dropdownContent.appendChild(infoImagesContainer);
            dropdownContent.appendChild(img);
            dropdownContent.appendChild(navigationContainer);
            dropdownContent.appendChild(num);



        }
    }

    // Navegar hacia atrás
    leftArea.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation(); // Detener propagación para evitar clic en la imagen
        if (currentIndex > 0) {
            currentIndex--;
            updateImage();
        }
    });

    // Navegar hacia adelante
    rightArea.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation(); // Detener propagación para evitar clic en la imagen
        if (currentIndex < images.length - 1) {
            currentIndex++;
            updateImage();
        }
    });

    const dropdownTitleContaniner = document.createElement('div');
    // Función para ajustar la vista del dropdown
    function adjustDropdownView() {
        const isResponsive = window.innerWidth <= 700;

        if (isResponsive) {
            navigationContainer.style.display = 'flex'; // Mostrar navegación en responsivo
            infoImagesContainer.style.display = "flex";
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
            navigationContainer.style.display = 'none';
            infoImagesContainer.style.display = "none";
        }


    }

    // Añadir las áreas clicables a la navegación
    navigationContainer.appendChild(leftArea);
    navigationContainer.appendChild(rightArea);


    dropdownTitle.addEventListener('click', () => {
        const isOpen = dropdownContent.classList.toggle('dropdown-content-visible');
        navigationContainer.style.display = isOpen && window.innerWidth <= 700 ? 'flex' : 'none';

        // Actualizar el texto del título con el símbolo dinámico
        dropdownTitle.textContent = `${isOpen ? '+' : '+'} ${title}`;
    });

    // Agregar hover para mostrar el símbolo `+` al pasar el cursor
    dropdownTitle.addEventListener('mouseover', () => {
        if (!dropdownContent.classList.contains('dropdown-content-visible')) {
            dropdownTitle.textContent = `+ ${title}`; // Mostrar el símbolo en hover
        }
    });

    dropdownTitle.addEventListener('mouseout', () => {
        if (!dropdownContent.classList.contains('dropdown-content-visible')) {
            dropdownTitle.textContent = `${title}`; // Restaurar solo el título
        }
    });

    dropdownTitle.classList.add("hover-effect");

    if (title == `Exhibition`) {

        const exhibitionInfo = document.createElement('div');
        exhibitionInfo.innerHTML = `<span>${galleryData[startIndex].name}</span>`;
        dropdownContent.appendChild(exhibitionInfo);
    }

    dropdownTitleContaniner.classList.add('dropdownTitleContaniner');
    dropdownTitleContaniner.appendChild(dropdownTitle);
    dropdown.appendChild(dropdownTitleContaniner);
    dropdownTitle.appendChild(dropdownArrow);

    dropdown.appendChild(dropdownContent);
    container.appendChild(dropdown);

    // Inicializar vista al cargar
    adjustDropdownView();

    // Ajustar la vista al cambiar el tamaño de la pantalla
    window.addEventListener('resize', adjustDropdownView);
}


// Función para abrir la galería
function openGallery(startIndex) {
    // Verificar si es versión móvil
    if (window.innerWidth <= 700) {
        console.log("Galería no disponible en versión móvil.");
        return; // No abrir la galería en móviles
    }

    currentImageIndex = startIndex;
    const gallery = document.getElementById('gallery');
    gallery.classList.contains("hidden") ? gallery.classList.remove("hidden") : 1;

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
    const number = document.getElementById("gallery-number");

    number.textContent = (currentImageIndex + 1).toString() + "/" + galleryData.length.toString();

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
