
import { renderDashboardPage } from './pages/dashboard.js';
import { renderBooksPage } from './pages/books.js';
import { renderCategoriesPage } from './pages/categories.js';

const app = document.getElementById('app');

const routes = {
    dashboard: renderDashboardPage,
    books: renderBooksPage,
    categories: renderCategoriesPage,
};

async function navigate() {
    const page = window.location.hash.replace('#', '').split('?')[0] || 'dashboard';

    const renderPage = routes[page] || renderDashboardPage;

    document.querySelectorAll('nav a').forEach(link => {
        const linkPage = link.getAttribute('href').replace('#', '');

        if (linkPage === page) {
            link.classList.add('bg-blue-100', 'text-blue-700', 'font-semibold');
        } else {
            link.classList.remove('bg-blue-100', 'text-blue-700', 'font-semibold');
        }
    });

    app.innerHTML = `
        <div class="text-center py-16 text-gray-400">
            Memuat...
        </div>
    `;

    try {
        await renderPage(app);
    } catch (error) {
        console.error(error);

        app.innerHTML = `
            <div class="text-center py-16">
                <p class="text-red-600 font-medium">Terjadi kesalahan</p>
                <p class="text-sm text-gray-500 mt-2">${error.message}</p>
            </div>
        `;
    }
}

window.addEventListener('hashchange', navigate);

navigate();
