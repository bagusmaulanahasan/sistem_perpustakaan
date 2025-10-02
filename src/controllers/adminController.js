const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const Borrowing = require("../models/borrowingModel");

exports.showBorrowedList = async (req, res) => {
    try {
        const searchTerm = req.query.search || "";
        const borrowings = await Borrowing.findActiveWithSearch(searchTerm);

        res.render("admin/borrowings/index", {
            title: "Buku Sedang Dipinjam",
            borrowings,
            searchTerm,
            count: borrowings.length,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.showHistoryList = async (req, res) => {
    try {
        const searchTerm = req.query.search || "";
        const borrowings = await Borrowing.findHistoryWithSearch(searchTerm);

        res.render("admin/borrowings/history", {
            title: "Riwayat Peminjaman",
            borrowings,
            searchTerm,
            count: borrowings.length,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.returnBook = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Borrowing.processReturn(id);

        if (!result.success) {
            return res.status(500).send(result.error);
        }

        res.redirect("/admin/borrowings");
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan saat memproses pengembalian");
    }
};

exports.downloadHistoryPDF = async (req, res) => {
    try {
        const borrowings = await Borrowing.findAllHistorySortedByUsername();

        const templatePath = path.join(
            __dirname,
            "..",
            "views",
            "laporan",
            "admin-riwayat.ejs"
        );
        const html = await ejs.renderFile(templatePath, { borrowings });

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

        const filename = `Laporan_Riwayat_Peminjaman_${Date.now()}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${filename}`
        );
        res.send(pdfBuffer);
    } catch (error) {
        console.error("Error saat membuat laporan PDF admin:", error);
        res.status(500).send("Gagal membuat laporan PDF.");
    }
};

exports.downloadActiveBorrowsPDF = async (req, res) => {
    try {
        const borrowings = await Borrowing.findAllActiveSortedByUsername();

        const templatePath = path.join(
            __dirname,
            "..",
            "views",
            "laporan",
            "admin-sedang-dipinjam.ejs"
        );
        const html = await ejs.renderFile(templatePath, { borrowings });

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

        const filename = `Laporan_Sedang_Dipinjam_${Date.now()}.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${filename}`
        );
        res.send(pdfBuffer);
    } catch (error) {
        console.error(
            "Error saat membuat laporan PDF Peminjaman Aktif:",
            error
        );
        res.status(500).send("Gagal membuat laporan PDF.");
    }
};
