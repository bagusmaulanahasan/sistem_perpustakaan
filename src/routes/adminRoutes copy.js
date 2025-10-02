const express = require("express");
const router = express.Router();

const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const categoryController = require("../controllers/categoryController");
const bookController = require("../controllers/bookController");
const adminController = require("../controllers/adminController");
const upload = require("../middleware/uploadMiddleware");

router.use(isLoggedIn, isAdmin);

router.get("/", (req, res) => res.redirect("/admin/books"));

router.get("/categories", categoryController.listCategories);
router.get("/categories/new", categoryController.getCreatePage);
router.post("/categories", categoryController.postCreateCategory);
router.get("/categories/edit/:id", categoryController.getEditPage);
router.post("/categories/update/:id", categoryController.postUpdateCategory);
router.post("/categories/delete/:id", categoryController.postDeleteCategory);

router.get("/books", bookController.listBooks);
router.get("/books/new", bookController.getCreatePage);
router.post("/books", bookController.postCreateBook);
router.get("/books/edit/:id", bookController.getEditPage);
router.post("/books/update/:id", bookController.postUpdateBook);
router.post("/books/delete/:id", bookController.postDeleteBook);

router.get("/borrowings", adminController.showBorrowedList);
router.post("/borrowings/return/:id", adminController.returnBook);

router.get("/history", adminController.showHistoryList);
router.get("/history/download", adminController.downloadHistoryPDF);

module.exports = router;
