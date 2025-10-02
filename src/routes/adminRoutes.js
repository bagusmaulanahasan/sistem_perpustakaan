const express = require("express");
const router = express.Router();

const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const categoryController = require("../controllers/categoryController");
const adminController = require("../controllers/adminController");

router.use(isLoggedIn, isAdmin);

router.get("/", (req, res) => res.redirect("/admin/books"));

router.get("/categories", categoryController.listCategories);
router.get("/categories/new", categoryController.getCreatePage);
router.post("/categories", categoryController.postCreateCategory);
router.get("/categories/edit/:id", categoryController.getEditPage);
router.post("/categories/update/:id", categoryController.postUpdateCategory);
router.post("/categories/delete/:id", categoryController.postDeleteCategory);

router.get("/borrowings", adminController.showBorrowedList);
router.post("/borrowings/return/:id", adminController.returnBook);
router.get("/borrowings/download", adminController.downloadActiveBorrowsPDF);

router.get("/history", adminController.showHistoryList);
router.get("/history/download", adminController.downloadHistoryPDF);

module.exports = router;
