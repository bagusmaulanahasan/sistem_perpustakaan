// Di paling atas file: src/routes/bookRoutes.js

const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
const uploadWithValidation = require('../middleware/uploadMiddleware');

// --- TAMBAHKAN BLOK DEBUGGING INI ---
console.log('=====================================================');
console.log('--- Memeriksa Impor Controller di bookRoutes.js ---');
console.log('Isi dari object bookController:', bookController);
console.log('Tipe dari bookController.postCreateBook:', typeof bookController.postCreateBook);
console.log('=====================================================');
// --- AKHIR BLOK DEBUGGING ---


// Lindungi semua rute di file ini dengan middleware login dan admin
router.use(isLoggedIn, isAdmin);

// Rute untuk menampilkan semua buku dan form tambah/edit
router.get('/', bookController.listBooks);
router.get('/new', bookController.getCreatePage);
router.get('/edit/:id', bookController.getEditPage);

// Rute untuk download laporan PDF data buku
router.get('/download', bookController.downloadBookListPDF);

// Rute untuk memproses form (Create, Update, Delete)
// Middleware upload HANYA diterapkan pada rute yang membutuhkan upload file
router.post('/', uploadWithValidation, bookController.postCreateBook);
router.post('/update/:id', uploadWithValidation, bookController.postUpdateBook);
router.post('/delete/:id', bookController.postDeleteBook);

module.exports = router;