
import { categoriesApi } from '../api.js';
import { showToast, confirmAction, escapeHtml } from '../utils.js';

export async function renderCategoriesPage(container) {
    container.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 page-enter">
            <div>
                <h2 class="text-2xl font-bold text-gray-800">Manajemen Kategori</h2>
                <p class="text-gray-500">Kelola kategori buku perpustakaan</p>
            </div>
            <button id="btn-add" class="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 shadow">
                <span class="text-xl leading-none">+</span> Tambah Kategori
            </button>
        </div>

        <div id="table-container" class="bg-white rounded-xl shadow overflow-hidden">
            <div class="p-8 text-center text-gray-500">Memuat data...</div>
        </div>
    `;

    document.getElementById('btn-add').onclick = () => openModal();
    await loadCategories();
}

async function loadCategories() {
    const container = document.getElementById('table-container');

    try {
        const { data: categories } = await categoriesApi.list();

        if (categories.length === 0) {
            container.innerHTML = `
                <div class="p-12 text-center">
                    <div class="text-5xl mb-4">🏷️</div>
                    <p class="text-gray-500 mb-4">Belum ada kategori</p>
                    <button id="btn-first-category" class="text-blue-700 hover:underline font-medium">
                        Tambah kategori pertama &rarr;
                    </button>
                </div>
            `;
            document.getElementById('btn-first-category').onclick = () => openModal();
            return;
        }

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nama</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Deskripsi</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        ${categories.map(category => `
                            <tr class="hover:bg-gray-50 transition">
                                <td class="px-6 py-4 text-sm text-gray-500">#${category.id}</td>
                                <td class="px-6 py-4 font-medium text-gray-800">${escapeHtml(category.nama)}</td>
                                <td class="px-6 py-4 text-sm text-gray-600">${escapeHtml(category.deskripsi || '-')}</td>
                                <td class="px-6 py-4 text-right space-x-3">
                                    <button data-edit="${category.id}" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                                    <button data-delete="${category.id}" class="text-red-600 hover:text-red-800 text-sm font-medium">Hapus</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.querySelectorAll('[data-edit]').forEach(btn => {
            btn.onclick = () => {
                const category = categories.find(
                    item => item.id === parseInt(btn.dataset.edit)
                );
                openModal(category);
            };
        });

        container.querySelectorAll('[data-delete]').forEach(btn => {
            btn.onclick = () => deleteCategory(parseInt(btn.dataset.delete));
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

function openModal(category = null) {
    const isEdit = category !== null;

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4';

    modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 page-enter">
            <h3 class="text-xl font-bold text-gray-800 mb-5">
                ${isEdit ? 'Edit Kategori' : 'Tambah Kategori'}
            </h3>

            <form id="category-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nama Kategori *</label>
                    <input name="nama" type="text" required maxlength="100"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea name="deskripsi" rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none resize-none"></textarea>
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

    const form = modal.querySelector('#category-form');

    if (category) {
        form.querySelector('[name="nama"]').value = category.nama;
        form.querySelector('[name="deskripsi"]').value = category.deskripsi || '';
    }

    const close = () => {
        modal.remove();
        document.body.classList.remove('modal-open');
    };

    modal.querySelector('[data-close]').onclick = close;

    modal.onclick = (e) => {
        if (e.target === modal) close();
    };

    form.onsubmit = async (e) => {
        e.preventDefault();

        const fd = new FormData(form);

        const payload = {
            nama: fd.get('nama').trim(),
            deskripsi: fd.get('deskripsi').trim(),
        };

        try {
            if (isEdit) {
                await categoriesApi.update(category.id, payload);
                showToast('Kategori berhasil diperbarui', 'success');
            } else {
                await categoriesApi.create(payload);
                showToast('Kategori berhasil ditambahkan', 'success');
            }

            close();
            await loadCategories();

        } catch (error) {
            showToast(error.message, 'error');
        }
    };
}

async function deleteCategory(id) {
    if (!confirmAction('Yakin ingin menghapus kategori ini?')) return;

    try {
        await categoriesApi.destroy(id);
        showToast('Kategori berhasil dihapus', 'success');
        await loadCategories();
    } catch (error) {
        showToast(error.message, 'error');
    }
}
