const path = require('path');
const ejs = require('ejs');
const puppeteer = require('puppeteer');
const Borrowing = require('../models/borrowingModel');

// Menampilkan halaman daftar buku yang sedang dipinjam
exports.showBorrowedList = async (req, res) => {
    try {
        const searchTerm = req.query.search || ''; // Ambil kata kunci dari URL, defaultnya string kosong
        const borrowings = await Borrowing.findActiveWithSearch(searchTerm);

        res.render('admin/borrowings/index', {
            title: 'Buku Sedang Dipinjam',
            borrowings,
            searchTerm, // Kirim searchTerm ke view untuk ditampilkan di input
            count: borrowings.length // Jumlah hasil pencarian
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Menampilkan halaman riwayat peminjaman
exports.showHistoryList = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        const borrowings = await Borrowing.findHistoryWithSearch(searchTerm);

        res.render('admin/borrowings/history', { // <-- Render view baru: history.ejs
            title: 'Riwayat Peminjaman',
            borrowings,
            searchTerm,
            count: borrowings.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Memproses pengembalian buku
exports.returnBook = async (req, res) => {
    try {
        const { id } = req.params; // id di sini adalah borrowing_id
        const result = await Borrowing.processReturn(id);

        if (!result.success) {
            // Di aplikasi nyata, gunakan flash message untuk menampilkan error
            return res.status(500).send(result.error);
        }

        res.redirect('/admin/borrowings');
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat memproses pengembalian');
    }
};

// FUNGSI BARU UNTUK DOWNLOAD LAPORAN RIWAYAT SEBAGAI PDF
exports.downloadHistoryPDF = async (req, res) => {
    try {
        // Panggil fungsi baru dari model yang mengurutkan berdasarkan nama
        const borrowings = await Borrowing.findAllHistorySortedByUsername();

        // Render template EJS khusus laporan admin
        const templatePath = path.join(__dirname, '..', 'views', 'laporan', 'admin-riwayat.ejs');
        const html = await ejs.renderFile(templatePath, { borrowings });

        // Proses Puppeteer untuk membuat PDF
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '25px', right: '25px', bottom: '25px', left: '25px' }
        });

        await browser.close();

        // Kirim PDF ke browser
        const filename = `Laporan_Riwayat_Peminjaman_${Date.now()}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error saat membuat laporan PDF admin:', error);
        res.status(500).send('Gagal membuat laporan PDF.');
    }
};