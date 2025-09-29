const Book = require('../models/bookModel');
const Category = require('../models/categoryModel');
const Wishlist = require('../models/wishlistModel'); // <-- Tambahkan ini di atas
const Borrowing = require('../models/borrowingModel'); // <-- Impor model baru
const db = require('../config/database'); // <-- Impor pool database untuk transaksi

// Menampilkan halaman katalog buku
exports.showCatalog = async (req, res) => {
    try {
        const { kategori } = req.query; // Ambil query string ?kategori=id
        let books;

        if (kategori) {
            // Jika ada filter kategori, cari buku berdasarkan kategori
            books = await Book.findByCategory(kategori);
        } else {
            // Jika tidak, tampilkan semua buku
            books = await Book.findAll();
        }
        
        const categories = await Category.findAll();

        res.render('member/katalog', {
            title: 'Katalog Buku',
            books,
            categories,
            selectedCategory: kategori // Untuk menandai kategori aktif di view
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Menampilkan halaman detail satu buku
exports.showBookDetail = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).send('Buku tidak ditemukan');
        }

        res.render('member/detail', {
            title: book.title,
            book
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Menampilkan halaman wishlist
exports.showWishlist = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const books = await Wishlist.findByUser(userId);
        res.render('member/wishlist', {
            title: 'Wishlist Saya',
            books
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Menambahkan buku ke wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const bookId = req.params.id;
        await Wishlist.add(userId, bookId);
        // Redirect kembali ke halaman sebelumnya
        // res.redirect('back');
        res.redirect('/wishlist');
    } catch (error) {
        console.error(error);
        res.status(500).send('Gagal menambahkan ke wishlist');
    }
};

// Menghapus buku dari wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const bookId = req.params.id;
        await Wishlist.remove(userId, bookId);
        res.redirect('/wishlist');
    } catch (error) {
        console.error(error);
        res.status(500).send('Gagal menghapus dari wishlist');
    }
};


// Memproses peminjaman buku (DENGAN TRANSAKSI)
exports.borrowBook = async (req, res) => {
    const userId = req.session.user.id;
    const bookId = req.params.id;
    
    // 1. Dapatkan koneksi dari pool
    const connection = await db.getConnection();
    
    try {
        // 2. Mulai transaksi
        await connection.beginTransaction();

        // 3. Cek stok buku
        const book = await Book.findById(bookId, connection);
        if (!book || book.stock <= 0) {
            await connection.rollback(); // Batalkan transaksi jika stok habis
            // Tambahkan flash message untuk error jika ada
            return res.redirect(`/buku/${bookId}`);
        }

        // 4. Kurangi stok buku
        await Book.decreaseStock(bookId, connection);

        // 5. Buat catatan peminjaman
        await Borrowing.create(userId, bookId, connection);

        // 6. Jika semua berhasil, commit transaksi
        await connection.commit();

        res.redirect('/dipinjam');

    } catch (error) {
        // 7. Jika ada error di tengah jalan, batalkan semua perubahan
        await connection.rollback();
        console.error('Transaction Error:', error);
        res.status(500).send('Proses peminjaman gagal.');
    } finally {
        // 8. Selalu lepaskan koneksi setelah selesai
        connection.release();
    }
};


// Menampilkan halaman buku yang sedang dipinjam
exports.showBorrowedBooks = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const books = await Borrowing.findActiveByUser(userId);
        res.render('member/borrowed', {
            title: 'Buku yang Sedang Dipinjam',
            books
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};


// Menampilkan halaman riwayat peminjaman
exports.showBorrowingHistory = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const books = await Borrowing.findHistoryByUser(userId);
        res.render('member/history', {
            title: 'Riwayat Peminjaman',
            books
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};
