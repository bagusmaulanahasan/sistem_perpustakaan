const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/covers");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                "-" +
                uniqueSuffix +
                path.extname(file.originalname)
        );
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    "Tipe file tidak valid! Hanya gambar (.jpg, .png, .gif, .webp) yang diizinkan."
                ),
                false
            );
        }
    },
}).single("cover_image");

const uploadWithValidation = (req, res, next) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === "LIMIT_FILE_SIZE") {
                req.fileValidationError =
                    "Ukuran file terlalu besar! Maksimal 2MB.";
            } else {
                req.fileValidationError = err.message;
            }
        } else if (err) {
            req.fileValidationError = err.message;
        }

        console.log(
            "MIDDLEWARE: Proses upload selesai. Melanjutkan ke controller..."
        );
        next();
    });
};

module.exports = uploadWithValidation;
