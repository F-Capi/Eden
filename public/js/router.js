
const toggleNumberingAndInfo = (show) => {
    const numbering = document.querySelector('.homepage-numbering');
    const info = document.querySelector('.homepage-info');

    if (numbering) numbering.style.display = show ? 'block' : 'none';
    if (info) info.style.display = show ? 'block' : 'none';
};

const loadPage = async (page, projectTitle = '') => {

    if ((page === 'home' || page === '') && window.matchMedia('(max-width: 700px)').matches) {
        page = 'about';
    }
    const contentDiv = document.getElementById('content');

    const oldScript = document.getElementById('pageScript');
    if (oldScript) oldScript.remove();

    contentDiv.classList.add('fade-out');
    await new Promise(resolve => setTimeout(resolve, 120));

    const navigationLinks = document.querySelectorAll(".nav a");
    navigationLinks.forEach(link => {
        link.addEventListener("click", () => {
            resetLinksBackgrounds();
            if (!link.classList.contains("home")) {
                link.classList.add("active-link");
            }
        });
    });

    function resetLinksBackgrounds() {
        navigationLinks.forEach(link => {
            link.classList.remove("active-link");
        });
    }
    toggleNumberingAndInfo(page === 'home');

    switch (page) {
        case 'home':
            contentDiv.innerHTML = await fetch('/partials/home.html').then(res => res.text());
            await loadScript('./js/home.js');
            break;

        case 'about':

            contentDiv.innerHTML = await fetch('/partials/about.html').then(res => res.text());
            await loadScript('./js/about.js');
            break;
        case 'work':

            contentDiv.innerHTML = await fetch('/partials/work.html').then(res => res.text());
            await loadScript('./js/work.js');
            break;
        case 'project':
            resetLinksBackgrounds();
            document.getElementById("index").classList.add("active-link");
            contentDiv.innerHTML = await fetch('/partials/projectPage.html').then(res => res.text());
            await loadScript('/js/project-page.js');
            break;
        default:
            contentDiv.innerHTML = "<h1>404 - Página no encontrada</h1>";
    }

    contentDiv.classList.remove('fade-out');
    contentDiv.classList.add('fade-in');

    setTimeout(() => contentDiv.classList.remove('fade-in'), 100);
};

const loadScript = (src) => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.id = 'pageScript';
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
};


const handleRoute = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);

    if (pathParts[0] === 'download') {
        window.location.href = location.pathname;
        return;
    }

    if (pathParts[0] === 'project' && pathParts[1]) {
        loadPage('project', decodeURIComponent(pathParts[1]));
    } else {
        const page = pathParts[0] || 'home';
        loadPage(page);
    }
};

window.addEventListener('popstate', handleRoute);

const navigateTo = (page, projectTitle = '') => {
    if (page === 'project' && projectTitle) {
        history.pushState({}, '', `/project/${encodeURIComponent(projectTitle)}`);
        loadPage(page, projectTitle);
    } else {
        history.pushState({}, '', `/${page}`);
        loadPage(page);
    }
};


document.addEventListener('DOMContentLoaded', () => {
    handleRoute();
});
