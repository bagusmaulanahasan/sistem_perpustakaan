// File: test-server.js

const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');

const app = express();

// 1. KONFIGURASI SESSION (Sama seperti punya Anda)
app.use(session({
    secret: 'secret-key-for-testing',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 }
}));

// 2. MIDDLEWARE OTENTIKASI (Versi sederhana)
const isLoggedIn = (req, res, next) => {
    console.log('SESSION CHECK:', req.session);
    if (!req.session.isLoggedIn) {
        return res.status(401).send('Anda harus login dulu. Pergi ke /login-test untuk login.');
    }
    console.log('Auth middleware passed.');
    next();
};

// 3. MIDDLEWARE UPLOAD (Sama seperti punya Anda, dengan console.log)
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => cb(null, 'public/uploads/covers'),
        filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
    })
}).single('cover_image');

const uploadWithLog = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            console.log('UPLOAD ERROR:', err);
            return res.status(500).send('Upload error: ' + err.message);
        }
        console.log('Middleware upload selesai, memanggil next()...');
        next();
    });
};

// 4. ROUTER SEDERHANA
const testRouter = express.Router();

// Terapkan middleware auth ke semua rute di router ini
testRouter.use(isLoggedIn);

// Definisikan rute POST untuk upload
testRouter.post('/upload', uploadWithLog, (req, res) => {
    console.log('--- KONTROLLER AKHIRNYA BERJALAN! ---');
    res.json({
        message: 'Upload berhasil!',
        body: req.body,
        file: req.file
    });
});

// Pasang router ke aplikasi utama
app.use('/test', testRouter);


// 5. RUTE TAMBAHAN UNTUK TESTING
// Rute untuk menampilkan form upload
app.get('/', (req, res) => {
    res.send(`
        <h1>Test Upload Form</h1>
        <p>Status Login: ${req.session.isLoggedIn ? 'Logged In' : 'Not Logged In'}</p>
        <p>Pergi ke <a href="/login-test">/login-test</a> untuk login.</p>
        <p>Pergi ke <a href="/logout-test">/logout-test</a> untuk logout.</p>
        <hr>
        <form action="/test/upload" method="POST" enctype="multipart/form-data">
            <label>Judul:</label>
            <input type="text" name="title"><br><br>
            <label>File Gambar:</label>
            <input type="file" name="cover_image"><br><br>
            <button type="submit">Upload</button>
        </form>
    `);
});

// Rute untuk "login" bohongan
app.get('/login-test', (req, res) => {
    req.session.isLoggedIn = true;
    res.redirect('/');
});

// Rute untuk logout
app.get('/logout-test', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});


// Jalankan server
app.listen(3001, () => {
    console.log('Server tes berjalan di http://localhost:3001');
});