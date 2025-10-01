const express = require('express');
const router = express.Router();

// Impor middleware dan semua controller yang dibutuhkan
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
const categoryController = require('../controllers/categoryController');
const bookController = require('../controllers/bookController');
const adminController = require('../controllers/adminController');
const upload = require('../middleware/uploadMiddleware');

// Lindungi semua rute admin dengan middleware
router.use(isLoggedIn, isAdmin);

// Rute Home Admin (contoh, bisa diarahkan ke data buku)
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
router.post('/books', bookController.postCreateBook);
router.get('/books/edit/:id', bookController.getEditPage);
router.post('/books/update/:id', bookController.postUpdateBook);
router.post('/books/delete/:id', bookController.postDeleteBook);

// Rute Peminjaman (Fitur Baru)
router.get('/borrowings', adminController.showBorrowedList);
router.post('/borrowings/return/:id', adminController.returnBook);

// Rute Riwayat Peminjaman (Fitur Baru)
router.get('/history', adminController.showHistoryList);

module.exports = router;