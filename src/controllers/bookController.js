const fs = require('fs');
const path = require('path'); // <-- TAMBAHKAN BARIS INI
const Book = require('../models/bookModel');
const Category = require('../models/categoryModel'); // Kita butuh model kategori
const multer = require('multer'); // Impor multer untuk cek error
const upload = require('../middleware/uploadMiddleware'); // <-- TAMBAHKAN BARIS INI

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


// GANTI FUNGSI LAMA DENGAN VERSI FINAL INI
exports.postCreateBook = async (req, res) => {
    // Middleware Multer sudah berjalan di Rute, jadi req.body dan req.file sudah tersedia di sini.

    // 1. Ambil data dari request body
    const bookData = { ...req.body };
    
    // 2. Lakukan validasi
    if (!bookData.title || !bookData.author) {
        const categories = await Category.findAll();
        return res.render('admin/books/create', {
            title: 'Tambah Buku Baru',
            categories,
            book: bookData,
            error: 'Judul dan Penulis tidak boleh kosong!'
        });
    }

    if (bookData.category_id === '') {
        bookData.category_id = null;
    }

    // 3. Tentukan path gambar
    if (req.file) {
        // Hapus 'public' dari path agar bisa diakses dari browser dengan benar
        bookData.cover_image_url = req.file.path.replace('public', '');
    } else {
        // Gunakan gambar default jika tidak ada file yang di-upload
        bookData.cover_image_url = '/uploads/covers/default.jpg';
    }

    // 4. Simpan ke database
    try {
        await Book.create(bookData);
        res.redirect('/admin/books');
    } catch (dbError) {
        console.error('DATABASE ERROR:', dbError);
        const categories = await Category.findAll();
        res.render('admin/books/create', {
            title: 'Tambah Buku Baru',
            categories,
            book: bookData,
            error: 'Gagal menyimpan buku ke database. Cek terminal untuk detail.'
        });
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

// FUNGSI UNTUK UPDATE BUKU
exports.postUpdateBook = async (req, res) => {
    // Middleware Multer sudah berjalan di Rute,
    // jadi req.body dan req.file sudah terisi penuh di sini.
    const { id } = req.params;

    try {
        const existingBook = await Book.findById(id);
        if (!existingBook) {
            return res.status(404).send('Buku tidak ditemukan');
        }

        // Siapkan data final untuk di-update, dimulai dengan data baru dari form
        const finalBookData = {
            title: req.body.title,
            author: req.body.author,
            publisher: req.body.publisher,
            publication_year: req.body.publication_year,
            stock: req.body.stock,
            category_id: req.body.category_id === '' ? null : req.body.category_id,
            cover_image_url: existingBook.cover_image_url // Gunakan gambar lama sebagai default
        };

        // Jika ada file BARU yang di-upload, timpa URL gambar dan hapus file lama
        if (req.file) {
            finalBookData.cover_image_url = req.file.path.replace('public', '');
            
            // Hapus gambar lama (jika ada dan bukan gambar default)
            if (existingBook.cover_image_url && existingBook.cover_image_url !== '/uploads/covers/default.jpg') {
                const oldImagePath = path.join(__dirname, '../../public', existingBook.cover_image_url);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        // Update data di database
        await Book.update(id, finalBookData);
        res.redirect('/admin/books');

    } catch (dbError) {
        console.error('DATABASE ERROR:', dbError);
        // Jika ada error saat update, render kembali halaman edit dengan pesan
        const categories = await Category.findAll();
        res.render('admin/books/edit', {
            title: 'Edit Buku',
            categories: categories,
            book: req.body, // Kirim kembali data yang baru diinput user
            error: 'Gagal mengupdate buku. Cek terminal untuk detail.'
        });
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