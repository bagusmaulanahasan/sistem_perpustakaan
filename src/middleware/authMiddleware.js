// Middleware untuk mengecek apakah user sudah login
exports.isLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    next();
};

// Middleware untuk mengecek apakah user adalah admin
exports.isAdmin = (req, res, next) => {
    // Pastikan user sudah login sebelum cek role
    if (!req.session.user || req.session.user.role !== 'admin') {
        // Mungkin bisa diarahkan ke halaman "unauthorized" atau halaman utama anggota
        return res.status(403).send('Akses ditolak: Anda bukan admin.');
    }
    next();
};

// FUNGSI BARU: Middleware untuk mengecek apakah user adalah anggota
exports.isAnggota = (req, res, next) => {
    // Pastikan user ada dan rolenya adalah 'anggota'
    if (req.session.user && req.session.user.role === 'anggota') {
        // Jika benar anggota, lanjutkan ke proses berikutnya
        return next();
    }
    // Jika bukan anggota (berarti admin), alihkan ke dashboard admin
    res.redirect('/admin');
};