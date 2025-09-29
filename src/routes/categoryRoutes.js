const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware'); // Middleware akan kita buat setelah ini

// Semua rute di file ini akan diawali dengan /admin/categories dan dilindungi
router.use(isLoggedIn, isAdmin);

// GET /admin/categories -> Tampilkan semua
router.get('/', categoryController.listCategories);

// GET /admin/categories/new -> Tampilkan form tambah
router.get('/new', categoryController.getCreatePage);

// POST /admin/categories -> Proses tambah data
router.post('/', categoryController.postCreateCategory);

// GET /admin/categories/edit/:id -> Tampilkan form edit
router.get('/edit/:id', categoryController.getEditPage);

// POST /admin/categories/update/:id -> Proses update data
router.post('/update/:id', categoryController.postUpdateCategory);

// POST /admin/categories/delete/:id -> Proses hapus data
router.post('/delete/:id', categoryController.postDeleteCategory);


module.exports = router;