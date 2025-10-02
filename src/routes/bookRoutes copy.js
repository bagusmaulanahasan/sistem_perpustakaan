const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(isLoggedIn, isAdmin);

router.post("/", upload.single("cover_image"), bookController.postCreateBook);
router.post(
    "/update/:id",
    upload.single("cover_image"),
    bookController.postUpdateBook
);

router.get("/", bookController.listBooks);
router.get("/new", bookController.getCreatePage);
router.post("/", bookController.postCreateBook);
router.get("/edit/:id", bookController.getEditPage);
router.post("/update/:id", bookController.postUpdateBook);
router.post("/delete/:id", bookController.postDeleteBook);

router.get("/download", bookController.downloadBookListPDF);

module.exports = router;
