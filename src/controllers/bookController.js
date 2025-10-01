const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Book = require('../models/bookModel');
const Category = require('../models/categoryModel');
const upload = require('../middleware/uploadMiddleware');

// Menampilkan daftar semua buku (versi sederhana tanpa pagination)
exports.listBooks = async (req, res) => {
    try {
        const books = await Book.findAll();
        res.render('admin/books/index', {
            books,
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
        const categories = await Category.findAll();
        res.render('admin/books/create', {
            categories,
            title: 'Tambah Buku Baru',
            book: null, // Kirim book sebagai null untuk form create
            error: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Memproses penambahan buku baru
// GANTI FUNGSI postCreateBook DENGAN INI
exports.postCreateBook = async (req, res) => {
    // Middleware upload sudah berjalan di rute, jadi req.body dan req.file sudah tersedia.
    try {
        const bookData = { ...req.body };

        if (!bookData.title || !bookData.author) {
            const categories = await Category.findAll();
            return res.render('admin/books/create', {
                title: 'Tambah Buku Baru', categories, book: bookData,
                error: 'Judul dan Penulis tidak boleh kosong!'
            });
        }
        if (bookData.category_id === '') {
            bookData.category_id = null;
        }

        if (req.file) {
            bookData.cover_image_url = req.file.path.replace('public', '');
        } else {
            bookData.cover_image_url = '/uploads/covers/default.jpg';
        }

        await Book.create(bookData);
        res.redirect('/admin/books');
    } catch (dbError) {
        console.error('DATABASE ERROR (Create):', dbError);
        const categories = await Category.findAll();
        res.render('admin/books/create', {
            title: 'Tambah Buku Baru', categories, book: req.body,
            error: 'Gagal menyimpan buku. Cek terminal untuk detail.'
        });
    }
};

// Menampilkan form untuk mengedit buku (INI FUNGSI YANG KEMUNGKINAN BESAR HILANG/RUSAK)
exports.getEditPage = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        const categories = await Category.findAll();
        if (!book) {
            return res.status(404).send('Buku tidak ditemukan');
        }
        res.render('admin/books/edit', {
            book, // Mengirim objek 'book' ke view
            categories,
            title: 'Edit Buku',
            error: null
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Memproses update buku
exports.postUpdateBook = async (req, res) => {
    // Middleware upload sudah berjalan di rute, jadi req.body dan req.file sudah tersedia.
    const { id } = req.params;

    try {
        const existingBook = await Book.findById(id);
        if (!existingBook) {
            return res.status(404).send('Buku tidak ditemukan');
        }

        const finalBookData = {
            title: req.body.title,
            author: req.body.author,
            publisher: req.body.publisher,
            publication_year: req.body.publication_year,
            stock: req.body.stock,
            category_id: req.body.category_id === '' ? null : req.body.category_id,
            cover_image_url: existingBook.cover_image_url
        };

        if (req.file) {
            finalBookData.cover_image_url = req.file.path.replace('public', '');
            if (existingBook.cover_image_url && existingBook.cover_image_url !== '/uploads/covers/default.jpg') {
                const oldImagePath = path.join(__dirname, '../../public', existingBook.cover_image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        await Book.update(id, finalBookData);
        res.redirect('/admin/books');

    } catch (dbError) {
        console.error('DATABASE ERROR (Update):', dbError);
        const categories = await Category.findAll();
        // Saat render ulang karena error, kita perlu fetch lagi data buku agar form terisi benar
        const bookForRender = await Book.findById(id);
        res.render('admin/books/edit', {
            title: 'Edit Buku',
            categories: categories,
            book: bookForRender,
            error: 'Gagal mengupdate buku. Cek terminal untuk detail.'
        });
    }
};

// Memproses penghapusan buku
exports.postDeleteBook = async (req, res) => {
    try {
        // Sebelum menghapus record buku, hapus dulu file gambarnya jika ada
        const book = await Book.findById(req.params.id);
        if (book && book.cover_image_url && book.cover_image_url !== '/uploads/covers/default.jpg') {
            const imagePath = path.join(__dirname, '../../public', book.cover_image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        await Book.remove(req.params.id);
        res.redirect('/admin/books');
    } catch (error) {
        console.error(error);
        res.status(500).send('Gagal menghapus buku');
    }
};