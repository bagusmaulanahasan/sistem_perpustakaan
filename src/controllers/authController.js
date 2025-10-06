const bcrypt = require("bcryptjs");
const User = require("../models/userModel");

exports.getRegisterPage = (req, res) => {
    res.render("register", {
        title: "Register",
        layout: "./layouts/auth",
        error: null,
    });
};

exports.postRegister = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.render("register", {
                title: "Register",
                layout: "./layouts/auth",
                error: "Email sudah terdaftar.",
            });
        }

        if (password.length < 6 || password.length > 100) {
            return res.render("register", {
                title: "Register",
                layout: "./layouts/auth",
                error: "Password harus memiliki 6 hingga 100 karakter.",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create(username, email, hashedPassword);

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

exports.postLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // if (password.length < 6 || password.length > 100) {
        //     return res.render("login", {
        //         title: "Login",
        //         layout: "./layouts/auth",
        //         error: "Password harus memiliki 6 hingga 100 karakter.",
        //         success: null,
        //     });
        // }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.render("login", {
                title: "Login",
                layout: "./layouts/auth",
                error: "Email atau password salah.",
                success: null,
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", {
                title: "Login",
                layout: "./layouts/auth",
                error: "Email atau password salah.",
                success: null,
            });
        }

        req.session.isLoggedIn = true;
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        return res.redirect("/books");
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

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect("/login");
    });
};
