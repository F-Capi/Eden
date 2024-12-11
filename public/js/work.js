async function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;

        img.onload = () => resolve(src);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    });
}

async function loadProjects() {
    const contentDiv = document.querySelector('#projects');
    const scrollToTopButton = document.getElementById('backToTop');

    scrollToTopButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    });

    try {
        const response = await fetch('/api/work');

        if (!response.ok) {
            throw new Error('Error loading Projects');
        }

        const projects = await response.json();

        contentDiv.innerHTML = '';

        // Precargar todas las imágenes
        const allImages = projects.flatMap((project) =>
            project.imgs.map((img) => img.url)
        );

        await Promise.all(allImages.map(preloadImage));
        console.log('Todas las imágenes están precargadas.');

        // Crear contenido después de precargar
        const fragment = document.createDocumentFragment();

        projects.forEach((project) => {
            const projectElement = document.createElement('div');
            projectElement.classList.add('project');

            const projectInfo = document.createElement('div');
            projectInfo.classList.add('work-project-info');

            projectElement.appendChild(projectInfo);

            const span = document.createElement('span');
            span.innerHTML = project.year;
            span.classList.add('work-project-year');

            projectInfo.innerHTML = `
                <a class="work-project-title" href="/project/${project.id}">${project.name}</a><p class="work-project-plus">+</p>
            `;
            projectInfo.appendChild(span);

            const hiddenDetails = document.createElement('span');
            hiddenDetails.classList.add('hiddenDetails');
            hiddenDetails.innerHTML = project.details;

            projectInfo.appendChild(hiddenDetails);

            const images = document.createElement('div');
            images.classList.add('work-project-images');

            project.imgs.forEach((img) => {
                const di = document.createElement('div');
                di.classList.add('work-project-image-container');

                const a = document.createElement('a');
                a.href = `/project/${project.id}`;

                const i = document.createElement('img');
                i.loading = 'lazy'; // Lazy loading como respaldo
                i.src = img.url;

                // Añadir evento para transiciones suaves
                i.onload = () => i.classList.add('loaded');

                if (img.crop) {
                    di.classList.add('work-image-crop');
                }
                if (img.top) {
                    i.style.top = img.top;
                }
                if (img.left) {
                    i.style.left = img.left;
                }
                if (img.width) {
                    i.style.width = img.width;
                }

                a.appendChild(i);
                di.appendChild(a);
                images.appendChild(di);
            });

            projectElement.appendChild(images);
            fragment.appendChild(projectElement);
        });

        contentDiv.appendChild(fragment);
    } catch (error) {
        contentDiv.innerHTML = '<p>Error loading projects</p>';
        console.error(error);
    }
}

loadProjects();
