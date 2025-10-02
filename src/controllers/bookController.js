const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const Book = require("../models/bookModel");
const Category = require("../models/categoryModel");

exports.listBooks = async (req, res) => {
    try {
        const searchTerm = req.query.search || "";
        const options = { searchTerm };
        const books = await Book.findAll(options);
        const totalBooks = await Book.countAll(options);

        res.render("admin/books/index", {
            title: "Manajemen Buku",
            books,
            count: totalBooks,
            searchTerm,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.getCreatePage = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.render("admin/books/create", {
            categories,
            title: "Tambah Buku Baru",
            book: null,
            error: null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.postCreateBook = async (req, res) => {
    try {
        if (req.fileValidationError) {
            const categories = await Category.findAll();
            return res.render("admin/books/create", {
                title: "Tambah Buku Baru",
                categories,
                book: req.body,
                error: req.fileValidationError,
            });
        }

        const bookData = { ...req.body };

        if (!bookData.title || !bookData.author) {
            const categories = await Category.findAll();
            return res.render("admin/books/create", {
                title: "Tambah Buku Baru",
                categories,
                book: bookData,
                error: "Judul dan Penulis tidak boleh kosong!",
            });
        }
        if (bookData.category_id === "") {
            bookData.category_id = null;
        }

        if (req.file) {
            bookData.cover_image_url = req.file.path.replace("public", "");
        } else {
            bookData.cover_image_url = "/uploads/covers/default.jpg";
        }

        await Book.create(bookData);
        res.redirect("/admin/books");
    } catch (dbError) {
        console.error("CONTROLLER CATCH ERROR:", dbError);
        const categories = await Category.findAll();
        res.render("admin/books/create", {
            title: "Tambah Buku Baru",
            categories,
            book: req.body,
            error: "Gagal menyimpan buku. Cek terminal untuk detail.",
        });
    }
};

exports.getEditPage = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        const categories = await Category.findAll();
        if (!book) {
            return res.status(404).send("Buku tidak ditemukan");
        }
        res.render("admin/books/edit", {
            book,
            categories,
            title: "Edit Buku",
            error: null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.postUpdateBook = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.fileValidationError) {
            const book = await Book.findById(id);
            const categories = await Category.findAll();
            return res.render("admin/books/edit", {
                title: "Edit Buku",
                categories,
                book,
                error: req.fileValidationError,
            });
        }

        const existingBook = await Book.findById(id);
        if (!existingBook) {
            return res.status(404).send("Buku tidak ditemukan untuk diupdate");
        }

        const finalBookData = {
            ...req.body,
            category_id:
                req.body.category_id === "" ? null : req.body.category_id,
            cover_image_url: existingBook.cover_image_url,
        };

        if (req.file) {
            finalBookData.cover_image_url = req.file.path.replace("public", "");
            if (
                existingBook.cover_image_url &&
                existingBook.cover_image_url !== "/uploads/covers/default.jpg"
            ) {
                const oldImagePath = path.join(
                    __dirname,
                    "../../public",
                    existingBook.cover_image_url
                );
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        await Book.update(id, finalBookData);
        res.redirect("/admin/books");
    } catch (dbError) {
        console.error("DATABASE ERROR (Update):", dbError);
        const categories = await Category.findAll();
        const bookForRender = await Book.findById(id);
        res.render("admin/books/edit", {
            title: "Edit Buku",
            categories: categories,
            book: bookForRender,
            error: "Gagal mengupdate buku. Cek terminal untuk detail.",
        });
    }
};

exports.postDeleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (
            book &&
            book.cover_image_url &&
            book.cover_image_url !== "/uploads/covers/default.jpg"
        ) {
            const imagePath = path.join(
                __dirname,
                "../../public",
                book.cover_image_url
            );
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        await Book.remove(req.params.id);
        res.redirect("/admin/books");
    } catch (error) {
        console.error(error);
        res.status(500).send("Gagal menghapus buku");
    }
};

exports.downloadBookListPDF = async (req, res) => {
    try {
        const books = await Book.findAll();
        const templatePath = path.join(
            __dirname,
            "..",
            "views",
            "laporan",
            "admin-data-buku.ejs"
        );
        const html = await ejs.renderFile(templatePath, { books });

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

        const filename = `Laporan_Data_Buku_${Date.now()}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${filename}`
        );
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error saat membuat laporan PDF Data Buku:", error);
        res.status(500).send("Gagal membuat laporan PDF.");
    }
};
