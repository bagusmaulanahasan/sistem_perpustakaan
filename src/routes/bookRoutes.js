const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');

// Lindungi semua rute buku admin
router.use(isLoggedIn, isAdmin);

router.get('/', bookController.listBooks);
router.get('/new', bookController.getCreatePage);
router.post('/', bookController.postCreateBook);
router.get('/edit/:id', bookController.getEditPage);
router.post('/update/:id', bookController.postUpdateBook);
router.post('/delete/:id', bookController.postDeleteBook);

module.exports = router;