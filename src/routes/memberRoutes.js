const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { isLoggedIn } = require('../middleware/authMiddleware'); // Cukup cek login saja

// Lindungi semua rute di bawah ini
router.use(isLoggedIn);
// Rute utama untuk katalog
router.get('/katalog', memberController.showCatalog);
// Rute untuk melihat detail buku
router.get('/buku/:id', memberController.showBookDetail);

// Rute Wishlist
router.get('/wishlist', memberController.showWishlist);
router.post('/wishlist/tambah/:id', memberController.addToWishlist);
router.post('/wishlist/hapus/:id', memberController.removeFromWishlist);

// Rute Peminjaman
router.post('/pinjam/:id', memberController.borrowBook);
router.get('/dipinjam', memberController.showBorrowedBooks);
router.get('/riwayat', memberController.showBorrowingHistory);

// Rute Profil
router.get('/profil', memberController.getProfilePage);
router.post('/profil/update', memberController.updateProfile);
router.post('/profil/change-password', memberController.changePassword);

module.exports = router;