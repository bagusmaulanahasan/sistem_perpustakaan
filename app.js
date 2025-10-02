// app.js
const express = require('express');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts'); // <-- Tambahkan ini
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes'); // <-- Tambahkan ini
const bookRoutes = require('./src/routes/bookRoutes'); // <-- Tambahkan ini
const memberRoutes = require('./src/routes/memberRoutes'); // <-- Tambahkan ini
const adminRoutes = require('./src/routes/adminRoutes'); // <-- Impor rute admin

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi EJS
app.use(expressLayouts); // <-- Tambahkan ini
app.set('layout', './layouts/main'); // <-- Set layout default
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Untuk parsing body dari form

// Konfigurasi Session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Sesi berlaku selama 1 hari
    }
}));

// app.js (setelah app.use(session(...)))
app.use((req, res, next) => {
    res.locals.user = req.session.user; // Kirim data user ke semua view
    next();
});

// Menggunakan Routes
app.use('/', authRoutes);
// app.use('/admin/categories', categoryRoutes); // <-- Tambahkan ini
app.use('/admin/books', bookRoutes); // <-- Tambahkan ini
app.use('/', memberRoutes); // <-- Tambahkan ini
app.use('/admin', adminRoutes); // <-- Gunakan rute admin dengan awalan /admin

// Rute dasar
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Arahkan halaman utama ke katalog jika user sudah login
app.get('/', (req, res) => {
    if (req.session.isLoggedIn) {
        // Jika admin, arahkan ke dashboard admin, jika anggota, ke katalog
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin/books'); // Contoh dashboard admin
        }
        return res.redirect('/katalog');
    }
    res.redirect('/login');
});

// Ubah rute /books yang lama
app.get('/books', (req, res) => {
    // Rute ini sekarang bisa dihapus atau diarahkan
    res.redirect('/katalog');
});

// 2. Gunakan router dengan prefix '/member'
app.use('/member', memberRoutes); // <-- BAGIAN PALING PENTING


app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});