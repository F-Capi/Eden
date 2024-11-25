
async function loadProjects() {
    const contentDiv = document.querySelector('#projects');


    try {
        const response = await fetch('/api/work');

        if (!response.ok) {
            throw new Error('Error loading Projects');
        }

        const projects = await response.json();

        contentDiv.innerHTML = '';

        projects.forEach(project => {
            const projectElement = document.createElement('div');
            projectElement.classList.add('project');

            const hoverElement = document.createElement('div');
            hoverElement.classList.add('project-hover');

            const span = document.createElement('span');
            span.innerHTML = `<span>${project.year}</span>`;

            projectElement.appendChild(hoverElement);
            projectElement.appendChild(span);
            hoverElement.innerHTML = `
          <a href="/project/${project.id}">${project.name}</a>
         `;

            hoverElement.addEventListener("mouseover", () => {
                let cover = document.querySelector("#cover_container");
                cover.innerHTML = "";
                cover.innerHTML = `<img src="${project.cover}" alt="${project.name}"  />`
            });
            contentDiv.appendChild(projectElement);
        });
    } catch (error) {
        contentDiv.innerHTML = '<p>Error loading projects</p>';
        console.error(error);
    }
}

loadProjects();