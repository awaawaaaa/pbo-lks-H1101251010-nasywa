
import { booksApi } from '../api.js';
import { showToast, confirmAction, escapeHtml } from '../utils.js';

export async function renderBooksPage(container) {
    container.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 page-enter">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Manajemen Buku</h2>
                <p class="text-gray-500">Kelola koleksi buku perpustakaan</p>
            </div>
            <button id="btn-add" class="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 shadow">
                <span class="text-xl leading-none">+</span> Tambah Buku
            </button>
        </div>

        <div id="table-container" class="bg-white rounded-xl shadow overflow-hidden">
            <div class="p-8 text-center text-gray-500">Memuat data...</div>
        </div>
    `;

    document.getElementById('btn-add').onclick = () => openModal();
    await loadBooks();
}

async function loadBooks() {
    const container = document.getElementById('table-container');

    try {
        const { data: books } = await booksApi.list();

        if (books.length === 0) {
            container.innerHTML = `
                <div class="p-12 text-center">
                    <div class="text-5xl mb-4">📚</div>
                    <p class="text-gray-500 mb-4">Belum ada buku dalam koleksi</p>
                    <button onclick="document.getElementById('btn-add').click()"
                            class="text-blue-700 hover:underline font-medium">
                        Tambah buku pertama &rarr;
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Judul</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Penulis</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tahun</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stok</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${books.map(book => `
                            <tr class="hover:bg-gray-50 transition">
                                <td class="px-6 py-4 text-sm text-gray-500">#${book.id}</td>
                                <td class="px-6 py-4 font-medium text-gray-800">${escapeHtml(book.judul)}</td>
                                <td class="px-6 py-4 text-sm text-gray-600">${escapeHtml(book.penulis)}</td>
                                <td class="px-6 py-4 text-sm text-gray-600">${book.tahun}</td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        book.stok > 0
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }">
                                        ${book.stok} tersedia
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right space-x-3">
                                    <button data-edit="${book.id}" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                    <button data-delete="${book.id}" class="text-red-600 hover:text-red-800 text-sm font-medium">Hapus</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.querySelectorAll('[data-edit]').forEach(btn => {
            btn.onclick = () => {
                const book = books.find(b => b.id === parseInt(btn.dataset.edit));
                openModal(book);
            };
        });

        container.querySelectorAll('[data-delete]').forEach(btn => {
            btn.onclick = () => deleteBook(parseInt(btn.dataset.delete));
        });

    } catch (error) {
        showToast(error.message, 'error');
        container.innerHTML = `
            <div class="p-8 text-center text-red-600">
                Gagal memuat data: ${escapeHtml(error.message)}
            </div>
        `;
    }
}

function openModal(book = null) {
    const isEdit = book !== null;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';

    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 page-enter">
            <h3 class="text-xl font-bold text-gray-800 mb-5">
                ${isEdit ? 'Edit Buku' : 'Tambah Buku'}
            </h3>

            <form id="book-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Judul *</label>
                    <input name="judul" type="text" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Penulis *</label>
                    <input name="penulis" type="text" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none">
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tahun *</label>
                        <input name="tahun" type="number" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Stok *</label>
                        <input name="stok" type="number" required min="0"
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none">
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" data-close
                        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700">
                        Batal
                    </button>
                    <button type="submit"
                        class="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg font-medium">
                        ${isEdit ? 'Simpan' : 'Tambah'}
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.classList.add('modal-open');

    const form = modal.querySelector('#book-form');

    if (book) {
        form.querySelector('[name="judul"]').value = book.judul;
        form.querySelector('[name="penulis"]').value = book.penulis;
        form.querySelector('[name="tahun"]').value = book.tahun;
        form.querySelector('[name="stok"]').value = book.stok;
    } else {
        form.querySelector('[name="tahun"]').value = new Date().getFullYear();
        form.querySelector('[name="stok"]').value = 1;
    }

    const close = () => {
        modal.remove();
        document.body.classList.remove('modal-open');
    };

    modal.querySelectorAll('[data-close]').forEach(el => {
        el.onclick = close;
    });

    modal.onclick = (e) => {
        if (e.target === modal) close();
    };

    form.onsubmit = async (e) => {
        e.preventDefault();

        const fd = new FormData(form);

        const payload = {
            judul: fd.get('judul').trim(),
            penulis: fd.get('penulis').trim(),
            tahun: parseInt(fd.get('tahun')),
            stok: parseInt(fd.get('stok')),
        };

        try {
            if (isEdit) {
                await booksApi.update(book.id, payload);
                showToast('Buku berhasil diperbarui', 'success');
            } else {
                await booksApi.create(payload);
                showToast('Buku berhasil ditambahkan', 'success');
            }

            close();
            await loadBooks();

        } catch (error) {
            showToast(error.message, 'error');
        }
    };
}

async function deleteBook(id) {
    if (!confirmAction('Yakin ingin menghapus buku ini?')) return;

    try {
        await booksApi.destroy(id);
        showToast('Buku berhasil dihapus', 'success');
        await loadBooks();
    } catch (error) {
        showToast(error.message, 'error');
    }
}
