
/**
 * Utility functions untuk aplikasi.
 */

// Mencegah karakter HTML berbahaya masuk ke halaman
export function escapeHtml(value) {
    if (value === null || value === undefined) return '';

    return String(value).replace(/[&<>"']/g, (char) => {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
        };

        return entities[char];
    });
}

// Menampilkan notifikasi
export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const color = type === 'success'
        ? 'bg-green-600'
        : 'bg-red-600';

    toast.className = `${color} text-white px-4 py-3 rounded-lg shadow-lg`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Konfirmasi sebelum melakukan aksi
export function confirmAction(message) {
    return window.confirm(message);
}
