console.log("hello");
const loadPage = async (page, projectTitle = '') => {
    const contentDiv = document.getElementById('content');

    const oldScript = document.getElementById('pageScript');
    if (oldScript) oldScript.remove();

    contentDiv.classList.add('fade-out');
    await new Promise(resolve => setTimeout(resolve, 120));

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
