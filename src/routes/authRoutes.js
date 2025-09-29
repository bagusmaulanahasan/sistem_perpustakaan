// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rute untuk menampilkan halaman
router.get('/register', authController.getRegisterPage);
router.get('/login', authController.getLoginPage);

// Rute untuk memproses form
router.post('/register', authController.postRegister);
router.post('/login', authController.postLogin);

// Rute untuk logout
router.get('/logout', authController.logout);

module.exports = router;