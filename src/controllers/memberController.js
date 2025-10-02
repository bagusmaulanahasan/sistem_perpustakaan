const puppeteer = require("puppeteer");
const path = require("path");
const ejs = require("ejs");

const Book = require("../models/bookModel");
const Category = require("../models/categoryModel");
const Wishlist = require("../models/wishlistModel");
const Borrowing = require("../models/borrowingModel");
const db = require("../config/database");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

exports.showCatalog = async (req, res) => {
    try {
        const searchTerm = req.query.search || "";
        const categoryId = req.query.kategori || "";
        let books;

        const findOptions = { searchTerm, categoryId };
        const countOptions = { searchTerm, categoryId };

        books = await Book.findAll(findOptions);
        const totalBooks = await Book.countAll(countOptions);

        const categories = await Category.findAll();

        res.render("member/katalog", {
            title: "Katalog Buku",
            books,
            categories,
            count: totalBooks,
            selectedCategory: categoryId,
            searchTerm,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.showBookDetail = async (req, res) => {
    try {
        const bookId = req.params.id;
        const userId = req.session.user.id;

        const [book, isInWishlist, isBorrowed] = await Promise.all([
            Book.findById(bookId),
            Wishlist.check(userId, bookId),
            Borrowing.isCurrentlyBorrowed(userId, bookId),
        ]);

        if (!book) {
            return res.status(404).send("Buku tidak ditemukan");
        }

        res.render("member/detail", {
            title: book.title,
            book,
            isInWishlist,
            isBorrowed,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.showWishlist = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const searchTerm = req.query.search || "";
        const options = { searchTerm };

        const books = await Wishlist.findByUser(userId, options);
        const totalBooks = await Wishlist.countByUser(userId, options);

        res.render("member/wishlist", {
            title: "Wishlist Saya",
            books,
            count: totalBooks,
            searchTerm,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const bookId = req.params.id;
        await Wishlist.add(userId, bookId);

        res.redirect("/wishlist");
    } catch (error) {
        console.error(error);
        res.status(500).send("Gagal menambahkan ke wishlist");
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const bookId = req.params.id;
        await Wishlist.remove(userId, bookId);
        res.redirect("/wishlist");
    } catch (error) {
        console.error(error);
        res.status(500).send("Gagal menghapus dari wishlist");
    }
};

exports.borrowBook = async (req, res) => {
    const userId = req.session.user.id;
    const bookId = req.params.id;

    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const book = await Book.findById(bookId, connection);
        if (!book || book.stock <= 0) {
            await connection.rollback();

            return res.redirect(`/buku/${bookId}`);
        }

        await Book.decreaseStock(bookId, connection);

        await Borrowing.create(userId, bookId, connection);

        await connection.commit();

        res.redirect("/dipinjam");
    } catch (error) {
        await connection.rollback();
        console.error("Transaction Error:", error);
        res.status(500).send("Proses peminjaman gagal.");
    } finally {
        connection.release();
    }
};

exports.showBorrowedBooks = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const searchTerm = req.query.search || "";
        const options = { searchTerm };

        const books = await Borrowing.findActiveByUser(userId, options);
        const totalBooks = await Borrowing.countActiveByUser(userId, options);

        res.render("member/borrowed", {
            title: "Buku yang Sedang Dipinjam",
            books,
            count: totalBooks,
            searchTerm,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.showBorrowingHistory = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const searchTerm = req.query.search || "";
        const options = { searchTerm };

        const books = await Borrowing.findHistoryByUser(userId, options);
        const totalBooks = await Borrowing.countHistoryByUser(userId, options);

        res.render("member/history", {
            title: "Riwayat Peminjaman",
            books,
            count: totalBooks,
            searchTerm,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.getProfilePage = async (req, res) => {
    try {
        const user = req.session.user;
        res.render("member/profile", {
            title: "Profil Saya",
            user,
            success: req.query.success,
            error: req.query.error,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.updateProfile = async (req, res) => {
    const { id } = req.session.user;
    const { username, email } = req.body;

    if (!username || !email) {
        return res.redirect(
            "/profil?error=Username dan Email tidak boleh kosong"
        );
    }

    try {
        await User.updateProfile(id, username, email);

        req.session.user.username = username;
        req.session.user.email = email;

        res.redirect("/profil?success=Profil berhasil diperbarui");
    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.redirect(
                "/profil?error=Email sudah digunakan oleh akun lain"
            );
        }
        res.redirect("/profil?error=Gagal memperbarui profil");
    }
};

exports.changePassword = async (req, res) => {
    const { id } = req.session.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.redirect(
            "/profil?error=Password baru tidak cocok dengan konfirmasi"
        );
    }
    if (newPassword.length < 6) {
        return res.redirect(
            "/profil?error=Password baru minimal harus 6 karakter"
        );
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.redirect("/login");
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.redirect("/profil?error=Password saat ini salah");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await User.updatePassword(id, hashedPassword);

        res.redirect("/profil?success=Password berhasil diubah");
    } catch (error) {
        console.error(error);
        res.redirect("/profil?error=Gagal mengubah password");
    }
};

exports.downloadHistoryPDF = async (req, res) => {
    try {
        const userId = req.session.user.id;

        const user = await User.findById(userId);
        const borrowings = await Borrowing.findHistoryByUser(userId);

        if (!user) {
            return res.status(404).send("Pengguna tidak ditemukan");
        }

        const templatePath = path.join(
            __dirname,
            "..",
            "views",
            "laporan",
            "riwayat-peminjaman.ejs"
        );
        const html = await ejs.renderFile(templatePath, { user, borrowings });

        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "25px",
                right: "25px",
                bottom: "25px",
                left: "25px",
            },
        });

        await browser.close();

        const filename = `Riwayat_Peminjaman_${user.username.replace(
            /\s+/g,
            "_"
        )}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${filename}`
        );
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error saat membuat PDF:", error);
        res.status(500).send("Gagal membuat laporan PDF.");
    }
};
