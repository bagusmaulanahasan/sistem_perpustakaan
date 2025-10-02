const express = require("express");
const router = express.Router();
const memberController = require("../controllers/memberController");
const { isLoggedIn, isAnggota } = require("../middleware/authMiddleware");

router.get("/katalog", isLoggedIn, memberController.showCatalog);
router.get("/buku/:id", isLoggedIn, memberController.showBookDetail);

router.get("/wishlist", isLoggedIn, isAnggota, memberController.showWishlist);
router.post(
    "/wishlist/tambah/:id",
    isLoggedIn,
    isAnggota,
    memberController.addToWishlist
);
router.post(
    "/wishlist/hapus/:id",
    isLoggedIn,
    isAnggota,
    memberController.removeFromWishlist
);

router.post("/pinjam/:id", isLoggedIn, isAnggota, memberController.borrowBook);
router.get(
    "/dipinjam",
    isLoggedIn,
    isAnggota,
    memberController.showBorrowedBooks
);
router.get(
    "/riwayat",
    isLoggedIn,
    isAnggota,
    memberController.showBorrowingHistory
);

router.get("/profil", isLoggedIn, isAnggota, memberController.getProfilePage);
router.post(
    "/profil/update",
    isLoggedIn,
    isAnggota,
    memberController.updateProfile
);
router.post(
    "/profil/change-password",
    isLoggedIn,
    isAnggota,
    memberController.changePassword
);

router.get(
    "/history/download",
    isLoggedIn,
    isAnggota,
    memberController.downloadHistoryPDF
);

module.exports = router;
