
import { booksApi, categoriesApi } from '../api.js';
import { showToast, escapeHtml } from '../utils.js';

export async function renderDashboardPage(container) {
    container.innerHTML = `
        <div class="mb-6 page-enter">
            <h2 class="text-2xl font-bold text-gray-800">Dashboard</h2>
            <p class="text-gray-500">Ringkasan data perpustakaan</p>
        </div>

        <div id="stats" class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            ${skeletonCard()}
            ${skeletonCard()}
        </div>

        <div id="recent-books" class="bg-white rounded-xl shadow p-6">
            <div class="animate-pulse h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        </div>
    `;

    await loadDashboard();
}

async function loadDashboard() {
    try {
        const [booksResult, categoriesResult] = await Promise.all([
            booksApi.list(),
            categoriesApi.list()
        ]);

        const books = booksResult.data || [];
        const categories = categoriesResult.data || [];

        const totalStock = books.reduce(
            (total, book) => total + Number(book.stok || 0), 0
        );

        document.getElementById('stats').innerHTML = `
            <div class="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white">
                <p class="text-blue-100 text-sm font-medium">Total Buku</p>
                <p class="text-4xl font-bold mt-2">${books.length}</p>
                <p class="text-xs text-blue-100 mt-4">${totalStock} total stok tersedia</p>
            </div>

            <div class="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <p class="text-amber-100 text-sm font-medium">Kategori</p>
                <p class="text-4xl font-bold mt-2">${categories.length}</p>
                <p class="text-xs text-amber-100 mt-4">Kategori buku terdaftar</p>
            </div>
        `;

        const recentBooks = [...books]
            .sort((a, b) => b.id - a.id)
            .slice(0, 5);

        document.getElementById('recent-books').innerHTML = `
            <h3 class="text-lg font-bold text-gray-800 mb-4">Buku Terbaru</h3>

            ${
                recentBooks.length === 0
                ? '<p class="text-center py-8 text-gray-400">Belum ada buku</p>'
                : `<div class="divide-y">
                    ${recentBooks.map(book => `
                        <div class="flex justify-between items-center py-3">
                            <div>
                                <p class="font-medium text-gray-800">
                                    ${escapeHtml(book.judul)}
                                </p>
                                <p class="text-sm text-gray-500">
                                    ${escapeHtml(book.penulis)} &middot; ${book.tahun}
                                </p>
                            </div>
                            <span class="px-3 py-1 rounded-full text-xs font-medium ${
                                book.stok > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }">
                                Stok: ${book.stok}
                            </span>
                        </div>
                    `).join('')}
                </div>`
            }
        `;
    } catch (error) {
        showToast(error.message, 'error');

        document.getElementById('stats').innerHTML = `
            <div class="md:col-span-2 bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700">
                <p class="font-medium">Gagal memuat data</p>
                <p class="text-sm mt-1">${escapeHtml(error.message)}</p>
            </div>
        `;
    }
}

function skeletonCard() {
    return `
        <div class="bg-white rounded-xl shadow p-6">
            <div class="animate-pulse h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div class="animate-pulse h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
    `;
}
