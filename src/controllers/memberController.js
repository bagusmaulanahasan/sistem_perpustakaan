const Book = require('../models/bookModel');
const Category = require('../models/categoryModel');
const Wishlist = require('../models/wishlistModel'); // <-- Tambahkan ini di atas
const Borrowing = require('../models/borrowingModel'); // <-- Impor model baru
const db = require('../config/database'); // <-- Impor pool database untuk transaksi
const User = require('../models/userModel'); // Pastikan User model sudah diimpor
const bcrypt = require('bcryptjs');      // Impor bcrypt untuk password

// Menampilkan halaman katalog buku
exports.showCatalog = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        const categoryId = req.query.kategori || '';
        let books;

        const options = { searchTerm };

        if (categoryId) {
            // Jika ada filter kategori, cari buku di kategori tersebut
            books = await Book.findByCategory(categoryId, options);
        } else {
            // Jika tidak, cari di semua buku
            books = await Book.findAll(options);
        }
        
        const categories = await Category.findAll();

        res.render('member/katalog', {
            title: 'Katalog Buku',
            books,
            categories,
            selectedCategory: categoryId,
            searchTerm // Kirim searchTerm ke view
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

// GANTI FUNGSI showWishlist
exports.showWishlist = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const searchTerm = req.query.search || ''; // Ambil kata kunci dari URL

        // Panggil model dengan opsi pencarian
        const books = await Wishlist.findByUser(userId, { searchTerm });
        
        res.render('member/wishlist', {
            title: 'Wishlist Saya',
            books,
            searchTerm // Kirim searchTerm ke view
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


// Menampilkan halaman profil
exports.getProfilePage = async (req, res) => {
    try {
        // Ambil data user dari session untuk ditampilkan
        const user = req.session.user;
        res.render('member/profile', {
            title: 'Profil Saya',
            user,
            success: req.query.success, // Untuk notifikasi sukses
            error: req.query.error      // Untuk notifikasi error
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Memproses update profil (username & email)
exports.updateProfile = async (req, res) => {
    const { id } = req.session.user;
    const { username, email } = req.body;

    // Validasi dasar
    if (!username || !email) {
        return res.redirect('/profil?error=Username dan Email tidak boleh kosong');
    }

    try {
        await User.updateProfile(id, username, email);
        
        // Perbarui juga data di session agar header ikut berubah
        req.session.user.username = username;
        req.session.user.email = email;

        res.redirect('/profil?success=Profil berhasil diperbarui');
    } catch (error) {
        console.error(error);
        // Tangani error jika email sudah terdaftar (dari UNIQUE constraint di DB)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.redirect('/profil?error=Email sudah digunakan oleh akun lain');
        }
        res.redirect('/profil?error=Gagal memperbarui profil');
    }
};

// Memproses perubahan password
exports.changePassword = async (req, res) => {
    const { id } = req.session.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // 1. Validasi input
    if (newPassword !== confirmPassword) {
        return res.redirect('/profil?error=Password baru tidak cocok dengan konfirmasi');
    }
    if (newPassword.length < 6) {
        return res.redirect('/profil?error=Password baru minimal harus 6 karakter');
    }

    try {
        // 2. Ambil data user lengkap dari DB (termasuk hash password saat ini)
        const user = await User.findById(id);
        if (!user) {
            return res.redirect('/login'); // Sesi tidak valid
        }

        // 3. Verifikasi password saat ini
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.redirect('/profil?error=Password saat ini salah');
        }

        // 4. Hash password baru dan simpan
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await User.updatePassword(id, hashedPassword);

        res.redirect('/profil?success=Password berhasil diubah');
    } catch (error) {
        console.error(error);
        res.redirect('/profil?error=Gagal mengubah password');
    }
};
