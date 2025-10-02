const express = require('express');
const router = express.Router();

// Impor middleware dan semua controller yang dibutuhkan
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
const categoryController = require('../controllers/categoryController');
const bookController = require('../controllers/bookController');
const adminController = require('../controllers/adminController');
const upload = require('../middleware/uploadMiddleware'); // Pastikan ini diimpor

// Lindungi semua rute admin dengan middleware
router.use(isLoggedIn, isAdmin);

// Rute Home Admin
router.get('/', (req, res) => res.redirect('/admin/books'));

// Rute Kategori
router.get('/categories', categoryController.listCategories);
router.get('/categories/new', categoryController.getCreatePage);
router.post('/categories', categoryController.postCreateCategory);
router.get('/categories/edit/:id', categoryController.getEditPage);
router.post('/categories/update/:id', categoryController.postUpdateCategory);
router.post('/categories/delete/:id', categoryController.postDeleteCategory);

// Rute Buku
router.get('/books', bookController.listBooks);
router.get('/books/new', bookController.getCreatePage);
router.get('/books/edit/:id', bookController.getEditPage);
router.post('/books/delete/:id', bookController.postDeleteBook);

// --- PASTIKAN DUA BARIS DI BAWAH INI BENAR ---
// Rute untuk CREATE buku (membutuhkan middleware upload)
router.post('/books', upload.single('cover_image'), bookController.postCreateBook);

// Rute untuk UPDATE buku (juga membutuhkan middleware upload)
router.post('/books/update/:id', upload.single('cover_image'), bookController.postUpdateBook);
// ---------------------------------------------

// Rute Peminjaman
router.get('/borrowings', adminController.showBorrowedList);
router.post('/borrowings/return/:id', adminController.returnBook);

// Rute Riwayat Peminjaman
router.get('/history', adminController.showHistoryList);

// TAMBAHKAN RUTE BARU DI SINI
router.get('/history/download', adminController.downloadHistoryPDF);
router.get('/borrowings/download', adminController.downloadActiveBorrowsPDF);

module.exports = router;