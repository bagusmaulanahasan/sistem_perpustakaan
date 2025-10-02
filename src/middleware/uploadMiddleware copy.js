const multer = require('multer');
const path = require('path');

// 1. Konfigurasi Penyimpanan (DiskStorage)
const storage = multer.diskStorage({
    // Menentukan folder tujuan penyimpanan file
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/covers'); // Pastikan folder ini sudah ada
    },
    // Mengubah nama file agar unik (original name + timestamp)
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Filter File (Hanya Izinkan Gambar)
const fileFilter = (req, file, cb) => {
    // Cek tipe MIME file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true); // Terima file
    } else {
        // Tolak file dan kirim error
        cb(new Error('Tipe file tidak didukung! Hanya .jpeg, .jpg, dan .png yang diizinkan.'), false);
    }
};

// 3. Inisialisasi Multer dengan konfigurasi di atas
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 2 // Batas ukuran file: 2MB
    }
});

module.exports = upload;