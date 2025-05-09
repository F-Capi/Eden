let galleryData = [];
let currentImageIndex = -1;

async function preloadImages(images) {
    const promises = images.map((image) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = image.url;

            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${image.url}`));
        });
    });

    return Promise.all(promises);
}


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

        document.getElementById('project-title').textContent = data.name;
        document.getElementById('project-description').innerHTML = data.description;
        const feature = document.getElementById("featured-project");
        const featureContainer = document.getElementById("featured-project-container");
        if ("feature" in data) {
            featureContainer.style.display = "block";
            feature.style.display = "block";
            feature.textContent = data.feature;
            document.getElementById("dropdowns").style.marginTop = "28px";
            feature.href = data.featurelink;
            let curatorContainer = document.querySelector(".curator-container");
            if (curatorContainer) {
                feature.style.marginTop = "22px";
            }
            if (data.longer) {
                feature.style.width = "377px";
            }
        } else {

            featureContainer.style.display = "none";
            feature.style.display = "none";

        }

        const dropdownContainer = document.getElementById('dropdowns');

        if (data.photography) {
            data.photography.forEach(photo => {
                galleryData.push({
                    url: photo.url,
                    name: photo.name,
                    size: photo.size,
                    date: photo.date,
                    color: photo.color,
                    purchase: photo.purchase
                });
            });
            createDropdown(dropdownContainer, 'Photography', data.photography, galleryData.length - data.photography.length);
        }

        if (data.exhibitions && Array.isArray(data.exhibitions)) {
            createExhibitionDropdown(dropdownContainer, 'Exhibitions', data.exhibitions);
        }

        if (data.press && data.press.length > 0) {
            createPressDropdown(dropdownContainer, 'Press', data.press);
        }
        // Precargar todas las imágenes
        await preloadImages(galleryData);
    } catch (error) {
        console.error('Error loading project details:', error);
    }
}

function createExhibitionDropdown(container, title, exhibitions) {
    const exhibitionDropdown = document.createElement('div');
    exhibitionDropdown.classList.add('dropdown-container');
    const dropdownTitleContaniner = document.createElement('div');
    dropdownTitleContaniner.classList.add('dropdownTitleContaniner');

    const dropdownTitle = document.createElement('div');
    dropdownTitle.classList.add('dropdown-title', 'hover-effect');
    dropdownTitle.textContent = title;

    dropdownTitleContaniner.appendChild(dropdownTitle);
    exhibitionDropdown.appendChild(dropdownTitleContaniner);

    const dropdownContent = document.createElement('div');
    dropdownContent.classList.add('dropdown-content');
    dropdownContent.style.paddingTop = "16px";
    dropdownContent.style.paddingBottom = "0px";
    dropdownContent.style.flexDirection = "column";
    exhibitions.forEach((exhibition, groupIndex) => {
        const exhibitionGroup = document.createElement('div');
        exhibitionGroup.classList.add('exhibition-group');

        const exhibitionInfo = document.createElement('div');
        exhibitionInfo.classList.add('exhibition-info');
        exhibitionInfo.innerHTML = `
            <p class="exhibition-date">${exhibition.date}</p><p class="exhibition-details">${exhibition.location}</p>`;

        const exhibitionImagesContainer = document.createElement('div');
        exhibitionImagesContainer.classList.add('exhibition-images');

        let currentIndex = 0;
        const navigationContainer = document.createElement('div');
        navigationContainer.classList.add('dropdown-nav');

        const leftArea = document.createElement('div');
        leftArea.classList.add('nav-left');
        const rightArea = document.createElement('div');
        rightArea.classList.add('nav-right');

        const numberDisplay = document.createElement('p');
        numberDisplay.classList.add('gallery-number');

        exhibition.photography.forEach((url) => {
            galleryData.push({
                url,
                name: exhibition.name,
                exhibitionDate: exhibition.date,
                exhibitionLocation: exhibition.location,
                curator: exhibition.curator,
                assistant: exhibition.assistant,
                size: "",
                date: "",
                color: "",
                credit: exhibition.credit
            });
        });

        function updateImage() {
            exhibitionImagesContainer.innerHTML = '';
            const img = document.createElement('img');
            img.src = exhibition.photography[currentIndex];
            img.alt = exhibition.name;
            img.classList.add('exhibition-image');

            img.addEventListener('click', () => {
                if (window.innerWidth > 700) {
                    const galleryIndex = galleryData.findIndex(
                        data => data.url === exhibition.photography[currentIndex]
                    );
                    if (galleryIndex !== -1) openGallery(galleryIndex);
                }
            });

            exhibitionImagesContainer.appendChild(img);
            numberDisplay.textContent = `${currentIndex + 1} / ${exhibition.photography.length}`;
        }

        leftArea.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (currentIndex > 0) {
                currentIndex--;
                updateImage();
            }
        });

        rightArea.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (currentIndex < exhibition.photography.length - 1) {
                currentIndex++;
                updateImage();
            }
        });

        const adjustView = () => {
            if (window.innerWidth <= 700) {
                navigationContainer.style.display = 'flex';
                numberDisplay.style.display = 'block';
                exhibitionInfo.innerHTML = `<p class="ex-m-name">${exhibition.name}</p><p class="ex-m-date">${exhibition.date}</p><p class="ex-m-location">${exhibition.location}</p>`;
                if (exhibition.curator) {
                    exhibitionInfo.innerHTML += `<p class="ex-m-curator" >Curator: ${exhibition.curator.substring(10)}</p>`;
                }
                if (exhibition.assistant) {
                    exhibitionInfo.innerHTML += `<p class="ex-m-assistant" >Assistant: ${exhibition.assistant.substring(19)}</p>`;
                }
                if (exhibition.credit) {
                    exhibitionInfo.innerHTML += `<p class="ex-m-assistant" >Photo credit: ${exhibition.credit}</p>`;
                }
                updateImage();
            } else {
                exhibitionInfo.innerHTML = `
                <p class="exhibition-date">${exhibition.date}</p><p class="exhibition-details">${exhibition.location}</p>`;
                exhibitionImagesContainer.innerHTML = '';
                numberDisplay.style.display = 'none';
                exhibition.photography.forEach((url) => {
                    const img = document.createElement('img');
                    img.classList.add('exhibition-image');
                    img.src = url;
                    img.alt = exhibition.name;

                    const galleryIndex = galleryData.findIndex(data => data.url === url);
                    if (galleryIndex !== -1) {
                        img.addEventListener('click', () => openGallery(galleryIndex));
                    }

                    exhibitionImagesContainer.appendChild(img);
                });
                navigationContainer.style.display = 'none';
            }
        };


        navigationContainer.appendChild(leftArea);
        navigationContainer.appendChild(rightArea);

        exhibitionGroup.appendChild(exhibitionInfo);
        exhibitionGroup.appendChild(exhibitionImagesContainer);
        exhibitionGroup.appendChild(navigationContainer);
        exhibitionGroup.appendChild(numberDisplay);
        dropdownContent.appendChild(exhibitionGroup);

        adjustView();
        window.addEventListener('resize', adjustView);
    });


    dropdownTitle.addEventListener('click', () => {
        const isOpen = dropdownContent.classList.toggle('dropdown-content-visible');

        if (isOpen) {
            dropdownTitleContaniner.style.borderBottom = "1px solid #BCBCBC";

            const images = dropdownContent.querySelectorAll('img');
            images.forEach((img, index) => {
                img.style.animationDelay = `${index * 0.1}s`;
                img.classList.add('image-fade-in');
            });
        } else {
            const isLastDropdown = exhibitionDropdown === container.lastElementChild;
            if (!isLastDropdown) {

                dropdownTitleContaniner.style.borderBottom = "none";
            }
            const images = dropdownContent.querySelectorAll('img');
            images.forEach((img) => {
                img.classList.remove('image-fade-in');
                img.style.animationDelay = "";
            });
        }

        dropdownTitle.textContent = `${isOpen ? '+' : ''} ${title}`;
    });

    dropdownTitle.addEventListener('mouseover', () => {
        if (!dropdownContent.classList.contains('dropdown-content-visible')) {
            dropdownTitle.textContent = `+ ${title}`;
        }
    });

    dropdownTitle.addEventListener('mouseout', () => {
        if (!dropdownContent.classList.contains('dropdown-content-visible')) {
            dropdownTitle.textContent = `${title}`;
        }
    });
    dropdownTitle.classList.add("hover-effect");



    exhibitionDropdown.appendChild(dropdownContent);
    container.appendChild(exhibitionDropdown);
}


function createPressDropdown(container, title, pressItems) {
    const dropdown = document.createElement('div');
    dropdown.classList.add('dropdown-container');

    const dropdownTitle = document.createElement('div');
    dropdownTitle.classList.add('dropdown-title');
    dropdownTitle.textContent = title;

    const dropdownArrow = document.createElement("span");

    dropdownArrow.innerHTML = `+`;
    dropdownArrow.style.display = "none";
    dropdownArrow.classList.add("arrow");

    const dropdownContent = document.createElement('div');

    dropdownContent.style.flexDirection = "column";
    dropdownContent.classList.add('dropdown-content');
    dropdownContent.classList.add("press");
    pressItems.forEach(item => {
        const pressItem = document.createElement('div');
        pressItem.classList.add('press-item');

        var link;
        if (item.link != "") {
            link = document.createElement('a');
            link.href = item.link;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        } else {
            var link = document.createElement('span');
        }
        link.textContent = item.text;



        pressItem.appendChild(link);
        dropdownContent.appendChild(pressItem);
    });
    dropdownTitle.addEventListener('click', () => {
        const isOpen = dropdownContent.classList.toggle('dropdown-content-visible');

        dropdownTitle.textContent = `${isOpen ? '+' : ''} ${title}`;
    });


    dropdownTitle.addEventListener('mouseover', () => {
        if (!dropdownContent.classList.contains('dropdown-content-visible')) {
            dropdownTitle.textContent = `+ ${title}`;
        }
    });

    dropdownTitle.addEventListener('mouseout', () => {
        if (!dropdownContent.classList.contains('dropdown-content-visible')) {
            dropdownTitle.textContent = `${title}`;
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
    dropdownArrow.style.display = "none";
    dropdownArrow.classList.add("arrow");


    let currentIndex = 0;

    const infoImagesContainer = document.createElement('div');
    infoImagesContainer.classList.add('infoImagesContainer');

    const navigationContainer = document.createElement('div');
    navigationContainer.classList.add('dropdown-nav');

    const leftArea = document.createElement('div');
    leftArea.classList.add('nav-left');
    const rightArea = document.createElement('div');
    rightArea.classList.add('nav-right');

    function updateImage() {
        dropdownContent.innerHTML = '';
        const d = document.createElement("div");
        d.classList.add("fix-jump");
        const img = document.createElement('img');
        img.src = images[currentIndex].url || images[currentIndex];
        img.alt = images[currentIndex].name || title;

        // A partir de aqui
        if (title === "Exhibition") {
            infoImagesContainer.innerHTML = `<div id="gallery-top-info"><p id="gallery-name">${images[currentIndex].name}<br> ${images[currentIndex].exhibitionDate}<br> ${images[currentIndex].exhibitionLocation}</p></div>
            <div id="gallery-bottom-info">
            <p id="gallery-info1">${images[currentIndex].curator}</p>
            <p id="gallery-info2">${images[currentIndex].assistant}</p>
            ${images[currentIndex].credit ? `<p id="gallery-info3">Photo credit: ${images[currentIndex].credit}</p>` : ''}
            </div>`;

            img.classList.add('exhibition-image');
            const num = document.createElement("p");
            num.classList.add("gallery-number");
            num.innerHTML = `${currentIndex + 1}/${images.length}`;


            dropdownContent.appendChild(infoImagesContainer);
            d.appendChild(img);
            dropdownContent.appendChild(d);
            dropdownContent.appendChild(navigationContainer);
            dropdownContent.appendChild(num);
        } else {

            infoImagesContainer.innerHTML = `
            <div id="gallery-top-info">
                <p id="gallery-name">${images[currentIndex].name}, ${images[currentIndex].date}</p>
            </div>`

            infoImagesContainer.innerHTML +=
                `<div id="gallery-bottom-info">
                    <p id="gallery-info1">${images[currentIndex].size}</p>
                <p id="gallery-info2">${images[currentIndex].color}</p>
            </div>
            `;


            img.classList.add('dropdown-image');

            const num = document.createElement("p");
            num.classList.add("gallery-number");
            num.innerHTML = `${currentIndex + 1}/${images.length}`;


            dropdownContent.appendChild(infoImagesContainer);
            if (images[currentIndex].purchase) {
                const pur = document.createElement("p");
                pur.id = "purchase-link-mobile";
                pur.innerHTML = `You can Purchase this print <a href="${images[currentIndex].purchase}">here</a>`
                dropdownContent.appendChild(pur);
                console.log(images[currentIndex].purchase);
            }

            d.appendChild(img);
            dropdownContent.appendChild(d);
            dropdownContent.appendChild(navigationContainer);
            dropdownContent.appendChild(num);



        }
    }

    leftArea.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (currentIndex > 0) {
            currentIndex--;
            updateImage();
        }
    });

    rightArea.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (currentIndex < images.length - 1) {
            currentIndex++;
            updateImage();
        }
    });

    const dropdownTitleContaniner = document.createElement('div');
    function adjustDropdownView() {
        const isResponsive = window.innerWidth <= 700;

        if (isResponsive) {
            navigationContainer.style.display = 'flex';
            infoImagesContainer.style.display = "flex";
            updateImage();
        } else {
            dropdownContent.innerHTML = '';
            if (title === "Exhibition") {
                const exhibitionInfo = document.createElement('div');
                exhibitionInfo.classList.add('exhibition-info');
                exhibitionInfo.style.position = "absolute";
                const exhibitionData = galleryData[startIndex];
                // PONE LA INFO DE LA EXHIBICION
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

                if (image.breakLine) {
                    const saltoLinea = document.createElement('div');
                    saltoLinea.classList.add('salto-linea');
                    dropdownContent.appendChild(saltoLinea);
                }

                if (title === "Exhibition") {
                    img.classList.add('exhibition-image');

                } else {

                    img.classList.add('dropdown-image');

                }
                img.addEventListener('click', () => openGallery(startIndex + index));

                dropdownContent.appendChild(img);
            });
            navigationContainer.style.display = 'none';
            infoImagesContainer.style.display = "none";
        }


    }

    navigationContainer.appendChild(leftArea);
    navigationContainer.appendChild(rightArea);

    dropdownTitle.addEventListener('click', () => {
        const isOpen = dropdownContent.classList.toggle('dropdown-content-visible');

        if (isOpen) {
            dropdownTitleContaniner.style.borderBottom = "1px solid #BCBCBC";

            const images = dropdownContent.querySelectorAll('img');
            images.forEach((img, index) => {
                img.style.animationDelay = `${index * 0.1}s`; // Añade un retraso acumulativo
                img.classList.add('image-fade-in');
            });
        } else {
            const isLastDropdown = dropdown === container.lastElementChild;
            if (!isLastDropdown) {

                dropdownTitleContaniner.style.borderBottom = "none";
            }

            // Reinicia las animaciones al cerrar
            const images = dropdownContent.querySelectorAll('img');
            images.forEach((img) => {
                img.classList.remove('image-fade-in');
                img.style.animationDelay = "";
            });
        }

        dropdownTitle.textContent = `${isOpen ? '+' : ''} ${title}`;
    });


    dropdownTitle.addEventListener('mouseover', () => {
        if (!dropdownContent.classList.contains('dropdown-content-visible')) {
            dropdownTitle.textContent = `+ ${title}`;
        }
    });

    dropdownTitle.addEventListener('mouseout', () => {
        if (!dropdownContent.classList.contains('dropdown-content-visible')) {
            dropdownTitle.textContent = `${title}`;
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

    adjustDropdownView();

    window.addEventListener('resize', adjustDropdownView);
}

function openGallery(startIndex) {
    if (window.innerWidth <= 700) {
        console.log("Galería no disponible en versión móvil.");
        return;
    }

    currentImageIndex = startIndex;
    const gallery = document.getElementById('gallery');
    gallery.classList.contains("hidden") ? gallery.classList.remove("hidden") : 1;

    const otherContent = document.querySelectorAll('#content > :not(#gallery)');

    otherContent.forEach(el => el.classList.add('hidden'));

    gallery.style.display = 'flex';

    const back = document.getElementById("back-to-project");
    back.addEventListener("click", closeGallery);
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

    galleryImage.src = currentData.url;

    const infoTop = document.getElementById("gallery-info-top");
    const galleryName = document.getElementById('gallery-name');
    if (currentData.purchase) {
        document.getElementById("purchase-link").style.display = "block";
        document.querySelector("#purchase-link a").href = currentData.purchase;
    } else {
        document.getElementById("purchase-link").style.display = "none";
    }
    if (currentData.exhibitionDate) {
        infoTop.style.textDecoration = "none";
        galleryName.style.textDecoration = "underline";
        galleryName.textContent = currentData.name;
        document.getElementById('gallery-date').textContent = currentData.exhibitionDate;
        document.getElementById('gallery-date').classList.add("exhibition-gallery-date");
        document.getElementById('gallery-info0').textContent = currentData.exhibitionLocation;
        document.getElementById('gallery-info1').textContent = currentData.curator;
        document.getElementById('gallery-info2').textContent = currentData.assistant;

        const creditElement = document.getElementById('gallery-info3');
        if (creditElement) {
            if (currentData.credit) {
                creditElement.textContent = `Photo credit: ${currentData.credit}`;
                creditElement.style.display = 'block';
            } else {
                creditElement.style.display = 'none';
            }
        }
    } else {
        document.getElementById('gallery-info0').textContent = "";
        document.getElementById('gallery-info3').textContent = "";

        infoTop.style.textDecoration = "underline";
        galleryName.style.textDecoration = "none";
        document.getElementById('gallery-name').textContent = currentData.name + ",";
        if (document.getElementById('gallery-date').classList.contains("exhibition-gallery-date")) {
            document.getElementById('gallery-date').classList.remove("exhibition-gallery-date");

        }
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



function closeGallery() {
    const gallery = document.getElementById('gallery');
    const otherContent = document.querySelectorAll('#content > :not(#gallery)');

    otherContent.forEach(el => el.classList.remove('hidden'));

    gallery.style.display = 'none';
    currentImageIndex = -1;
}



document.getElementById('gallery').addEventListener('click', (event) => {
    const galleryImage = document.getElementById('gallery-image');
    const rect = galleryImage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const clickX = event.clientX;
    const purchase = document.querySelector('#purchase-link a');
    const purchaseRect = purchase.getBoundingClientRect();
    const isHoveringPurchase = event.clientX >= purchaseRect.left &&
        event.clientX <= purchaseRect.right &&
        event.clientY >= purchaseRect.top &&
        event.clientY <= purchaseRect.bottom;
    if (!isHoveringPurchase) {

        if (clickX < centerX) {
            // Mover hacia atrás
            if (currentImageIndex > 0) {
                currentImageIndex--;
                updateGallery();
            }
        } else {
            // Mover hacia adelante
            if (currentImageIndex < galleryData.length - 1) {
                currentImageIndex++;
                updateGallery();
            }
        }
    }
});

document.getElementById('gallery').addEventListener('mousemove', (event) => {
    const backButton = document.getElementById('back-to-project');
    const cursor = document.getElementById('custom-cursor');
    const galleryImage = document.getElementById('gallery-image');
    const rect = galleryImage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    const backButtonRect = backButton.getBoundingClientRect();

    const purchase = document.querySelector('#purchase-link a');
    const purchaseRect = purchase.getBoundingClientRect();
    const isHoveringPurchase = event.clientX >= purchaseRect.left &&
        event.clientX <= purchaseRect.right &&
        event.clientY >= purchaseRect.top &&
        event.clientY <= purchaseRect.bottom;

    const isHoveringBackButton =
        event.clientX >= backButtonRect.left &&
        event.clientX <= backButtonRect.right &&
        event.clientY >= backButtonRect.top &&
        event.clientY <= backButtonRect.bottom;


    if (isHoveringBackButton || isHoveringPurchase) {
        cursor.style.display = 'none';
        backButton.style.cursor = 'pointer';
    } else {
        cursor.style.display = 'block';
        cursor.style.left = `${event.pageX}px`;
        cursor.style.top = `${event.pageY}px`;

        if (event.clientX < centerX) {
            cursor.textContent = 'prev';
        } else {
            cursor.textContent = 'next';
        }
    }
});


document.getElementById('gallery').addEventListener('mouseleave', () => {
    const cursor = document.getElementById('custom-cursor');
    cursor.style.display = 'none';
});

document.getElementById('gallery').addEventListener('mouseenter', () => {
    const cursor = document.getElementById('custom-cursor');
    cursor.style.display = 'block';
});



loadProjectDetails();