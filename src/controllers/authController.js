// src/controllers/authController.js
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

// Menampilkan halaman registrasi
exports.getRegisterPage = (req, res) => {
    res.render("register", {
        title: "Register",
        layout: "./layouts/auth",
        error: null,
    });
};

// Memproses data registrasi
exports.postRegister = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Cek apakah emaiusernamel sudah terdaftar
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.render("register", {
                title: "Register",
                layout: "./layouts/auth",
                error: "Email sudah terdaftar.",
            });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // 3. Simpan user baru ke database
        await User.create(username, email, hashedPassword);

        // 4. Redirect ke halaman login dengan pesan sukses
        res.redirect("/login?success=registrasi");
    } catch (error) {
        console.error(error);
        res.render("register", {
            title: "Register",
            layout: "./layouts/auth",
            error: "Terjadi kesalahan pada server.",
        });
    }
};

// Menampilkan halaman login
exports.getLoginPage = (req, res) => {
    const successMessage =
        req.query.success === "registrasi"
            ? "Registrasi berhasil! Silakan login."
            : null;
    res.render("login", {
        title: "Login",
        layout: "./layouts/auth",
        error: null,
        success: successMessage,
    });
};

// Memproses data login
exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Cari user berdasarkan email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.render("login", {
                title: "Login",
                layout: "./layouts/auth",
                error: "Email atau password salah.",
                success: null,
            });
        }

        // 2. Bandingkan password yang diinput dengan yang ada di DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", {
                title: "Login",
                layout: "./layouts/auth",
                error: "Email atau password salah.",
                success: null,
            });
        }

        // 3. Buat session untuk user
        req.session.isLoggedIn = true;
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        
        // 4. Redirect ke halaman utama (misal: /books)
        return res.redirect("/books"); // Ganti dengan rute halaman utama Anda nanti
    } catch (error) {
        console.error(error);
        res.render("login", {
            title: "Login",
            layout: "./layouts/auth",
            error: "Terjadi kesalahan pada server.",
            success: null,
        });
    }
};

// Proses Logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/login");
    });
};
