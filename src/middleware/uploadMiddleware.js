const multer = require('multer');
const path = require('path');

// Konfigurasi Penyimpanan (DiskStorage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/covers');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Inisialisasi Multer dengan konfigurasi yang lebih detail
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2 // Batas ukuran file: 2MB
    },
    fileFilter: (req, file, cb) => {
        // Tentukan tipe file yang diizinkan
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true); // Terima file
        } else {
            // Tolak file dan buat error baru yang bisa kita tangkap
            cb(new Error('Tipe file tidak valid! Hanya gambar (.jpg, .png, .gif, .webp) yang diizinkan.'), false);
        }
    }
}).single('cover_image'); // Kita akan handle field 'cover_image'

// Middleware wrapper untuk menangani error Multer dengan lebih baik
const uploadWithValidation = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Error dari Multer (misal: file terlalu besar)
            if (err.code === 'LIMIT_FILE_SIZE') {
                req.fileValidationError = 'Ukuran file terlalu besar! Maksimal 2MB.';
            } else {
                req.fileValidationError = err.message;
            }
        } else if (err) {
            // Error kustom dari fileFilter (misal: tipe file salah)
            req.fileValidationError = err.message;
        }
        
        // Teruskan request ke controller, baik ada error maupun tidak.
        // Controller yang akan memutuskan apa yang harus dilakukan selanjutnya.


    console.log('MIDDLEWARE: Proses upload selesai. Melanjutkan ke controller...');
        next(); // <-- BARIS KRUSIAL YANG DITAMBAHKAN
    });
};

module.exports = uploadWithValidation;