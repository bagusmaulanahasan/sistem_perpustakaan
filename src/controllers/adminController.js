const Borrowing = require('../models/borrowingModel');

// Menampilkan halaman daftar buku yang sedang dipinjam
exports.showBorrowedList = async (req, res) => {
    try {
        const searchTerm = req.query.search || ''; // Ambil kata kunci dari URL, defaultnya string kosong
        const borrowings = await Borrowing.findActiveWithSearch(searchTerm);

        res.render('admin/borrowings/index', {
            title: 'Buku Sedang Dipinjam',
            borrowings,
            searchTerm, // Kirim searchTerm ke view untuk ditampilkan di input
            count: borrowings.length // Jumlah hasil pencarian
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Menampilkan halaman riwayat peminjaman
exports.showHistoryList = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        const borrowings = await Borrowing.findHistoryWithSearch(searchTerm);

        res.render('admin/borrowings/history', { // <-- Render view baru: history.ejs
            title: 'Riwayat Peminjaman',
            borrowings,
            searchTerm,
            count: borrowings.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Memproses pengembalian buku
exports.returnBook = async (req, res) => {
    try {
        const { id } = req.params; // id di sini adalah borrowing_id
        const result = await Borrowing.processReturn(id);

        if (!result.success) {
            // Di aplikasi nyata, gunakan flash message untuk menampilkan error
            return res.status(500).send(result.error);
        }

        res.redirect('/admin/borrowings');
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat memproses pengembalian');
    }
};


