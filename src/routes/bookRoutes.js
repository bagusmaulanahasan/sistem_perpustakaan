const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // <-- Impor konfigurasi Multer

// Lindungi semua rute buku admin
router.use(isLoggedIn, isAdmin);

// Terapkan middleware upload.single('nama_input_file')
router.post('/', upload.single('cover_image'), bookController.postCreateBook);
router.post('/update/:id', upload.single('cover_image'), bookController.postUpdateBook);

router.get('/', bookController.listBooks);
router.get('/new', bookController.getCreatePage);
router.post('/', bookController.postCreateBook);
router.get('/edit/:id', bookController.getEditPage);
router.post('/update/:id', bookController.postUpdateBook);
router.post('/delete/:id', bookController.postDeleteBook);

module.exports = router;