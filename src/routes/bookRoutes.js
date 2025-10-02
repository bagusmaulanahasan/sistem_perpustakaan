const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const uploadWithValidation = require("../middleware/uploadMiddleware");

router.use(isLoggedIn, isAdmin);

router.get("/", bookController.listBooks);
router.get("/new", bookController.getCreatePage);
router.get("/edit/:id", bookController.getEditPage);

router.get("/download", bookController.downloadBookListPDF);

router.post("/", uploadWithValidation, bookController.postCreateBook);
router.post("/update/:id", uploadWithValidation, bookController.postUpdateBook);
router.post("/delete/:id", bookController.postDeleteBook);

module.exports = router;
