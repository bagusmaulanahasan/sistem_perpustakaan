const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { isLoggedIn, isAdmin } = require("../middleware/authMiddleware");

router.use(isLoggedIn, isAdmin);

router.get("/", categoryController.listCategories);

router.get("/new", categoryController.getCreatePage);

router.post("/", categoryController.postCreateCategory);

router.get("/edit/:id", categoryController.getEditPage);

router.post("/update/:id", categoryController.postUpdateCategory);

router.post("/delete/:id", categoryController.postDeleteCategory);

module.exports = router;
