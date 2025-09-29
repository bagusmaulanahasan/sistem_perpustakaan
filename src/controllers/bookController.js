const Book = require('../models/bookModel');
const Category = require('../models/categoryModel'); // Kita butuh model kategori

// Menampilkan daftar semua buku
exports.listBooks = async (req, res) => {
    try {
        const books = await Book.findAll();
        res.render('admin/books/index', {
            books,
            user: req.session.user,
            title: 'Manajemen Buku'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Menampilkan form untuk menambah buku baru
exports.getCreatePage = async (req, res) => {
    try {
        const categories = await Category.findAll(); // Ambil semua kategori untuk dropdown
        res.render('admin/books/create', {
            categories,
            user: req.session.user,
            title: 'Tambah Buku Baru'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Memproses penambahan buku baru
exports.postCreateBook = async (req, res) => {
    try {
        // Untuk upload gambar, diperlukan middleware tambahan seperti 'multer'.
        // Untuk saat ini, kita simpan path gambar sebagai teks biasa.
        const bookData = { ...req.body, cover_image_url: '/images/default.jpg' };
        await Book.create(bookData);
        res.redirect('/admin/books');
    } catch (error) {
        console.error(error);
        res.status(500).send('Gagal menyimpan buku');
    }
};

// Menampilkan form untuk mengedit buku
exports.getEditPage = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        const categories = await Category.findAll(); // Tetap butuh kategori untuk dropdown
        if (!book) {
            return res.status(404).send('Buku tidak ditemukan');
        }
        res.render('admin/books/edit', {
            book,
            categories,
            user: req.session.user,
            title: 'Edit Buku'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Memproses update buku
exports.postUpdateBook = async (req, res) => {
    try {
        const { id } = req.params;
        // Asumsi path gambar tidak diubah jika tidak ada file baru yang diupload
        const bookData = { ...req.body };
        const existingBook = await Book.findById(id);
        bookData.cover_image_url = existingBook.cover_image_url; // Ganti dengan logika upload jika ada

        await Book.update(id, bookData);
        res.redirect('/admin/books');
    } catch (error) {
        console.error(error);
        res.status(500).send('Gagal mengupdate buku');
    }
};

// Memproses penghapusan buku
exports.postDeleteBook = async (req, res) => {
    try {
        await Book.remove(req.params.id);
        res.redirect('/admin/books');
    } catch (error) {
        console.error(error);
        res.status(500).send('Gagal menghapus buku');
    }
};