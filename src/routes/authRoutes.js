const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/register", authController.getRegisterPage);
router.get("/login", authController.getLoginPage);

router.post("/register", authController.postRegister);
router.post("/login", authController.postLogin);

router.get("/logout", authController.logout);

module.exports = router;
