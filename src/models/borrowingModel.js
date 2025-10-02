const db = require("../config/database");
const Book = require("./bookModel"); // Impor Book model untuk akses increaseStoc

const Borrowing = {
    // Membuat catatan peminjaman baru
    create: async (userId, bookId, connection) => {
        // Asumsi durasi pinjam adalah 14 hari
        const borrowDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(borrowDate.getDate() + 14);

        const sql =
            "INSERT INTO borrowings (user_id, book_id, borrow_date, due_date) VALUES (?, ?, ?, ?)";

        // Menggunakan koneksi yang di-passing untuk transaction
        await (connection || db).execute(sql, [
            userId,
            bookId,
            borrowDate,
            dueDate,
        ]);
    },

    // Menampilkan buku yang sedang dipinjam oleh user
    findActiveByUser: async (userId, options = {}) => {
        const { searchTerm } = options;
        let query = `
            SELECT b.title, b.author, b.publisher, c.name AS category_name,
                   br.borrow_date, br.due_date
            FROM borrowings br
            JOIN books b ON br.book_id = b.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE br.user_id = ? AND br.return_date IS NULL
        `;
        const params = [userId];

        if (searchTerm) {
            const likeTerm = `%${searchTerm}%`;
            const searchNumber = parseInt(searchTerm);

            query += ` AND (`;
            const searchConditions = [
                `b.title LIKE ?`,
                `b.author LIKE ?`,
                `b.publisher LIKE ?`,
                `c.name LIKE ?`,
                `MONTHNAME(br.borrow_date) LIKE ?`,
                `MONTHNAME(br.due_date) LIKE ?`,
            ];
            params.push(
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm
            );

            if (!isNaN(searchNumber)) {
                searchConditions.push(
                    `DAY(br.borrow_date) = ?`,
                    `MONTH(br.borrow_date) = ?`,
                    `YEAR(br.borrow_date) = ?`,
                    `DAY(br.due_date) = ?`,
                    `MONTH(br.due_date) = ?`,
                    `YEAR(br.due_date) = ?`
                );
                params.push(
                    searchNumber,
                    searchNumber,
                    searchNumber,
                    searchNumber,
                    searchNumber,
                    searchNumber
                );
            }
            query += searchConditions.join(" OR ") + `)`;
        }

        query += ` ORDER BY br.due_date ASC`;
        const [rows] = await db.execute(query, params);
        return rows;
    },

    // GANTI FUNGSI findHistoryByUser
    findHistoryByUser: async (userId, options = {}) => {
        const { searchTerm } = options;
        let query = `
            SELECT b.title, b.author, b.publisher, c.name AS category_name,
                   br.borrow_date, br.return_date
            FROM borrowings br
            JOIN books b ON br.book_id = b.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE br.user_id = ? AND br.return_date IS NOT NULL
        `;
        const params = [userId];

        if (searchTerm) {
            const likeTerm = `%${searchTerm}%`;
            const searchNumber = parseInt(searchTerm);

            query += ` AND (`;
            const searchConditions = [
                `b.title LIKE ?`,
                `b.author LIKE ?`,
                `b.publisher LIKE ?`,
                `c.name LIKE ?`,
                `MONTHNAME(br.borrow_date) LIKE ?`,
                `MONTHNAME(br.return_date) LIKE ?`,
            ];
            params.push(
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm
            );

            if (!isNaN(searchNumber)) {
                searchConditions.push(
                    `DAY(br.borrow_date) = ?`,
                    `MONTH(br.borrow_date) = ?`,
                    `YEAR(br.borrow_date) = ?`,
                    `DAY(br.return_date) = ?`,
                    `MONTH(br.return_date) = ?`,
                    `YEAR(br.return_date) = ?`
                );
                params.push(
                    searchNumber,
                    searchNumber,
                    searchNumber,
                    searchNumber,
                    searchNumber,
                    searchNumber
                );
            }
            query += searchConditions.join(" OR ") + `)`;
        }

        query += ` ORDER BY br.return_date DESC`;
        const [rows] = await db.execute(query, params);
        return rows;
    },

    // FUNGSI BARU: Menampilkan semua buku yang sedang dipinjam (untuk admin) dengan filter pencarian
    findActiveWithSearch: async (searchTerm) => {
        let query = `
            SELECT
                br.id AS borrowing_id,
                b.title,
                b.author,
                b.publisher,
                u.username,
                u.email,
                c.name AS category_name,
                br.borrow_date,
                br.due_date
            FROM borrowings br
            JOIN users u ON br.user_id = u.id
            JOIN books b ON br.book_id = b.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE br.return_date IS NULL
        `;
        const params = [];

        if (searchTerm) {
            query += ` AND (
                u.username LIKE ? OR
                u.email LIKE ? OR
                b.title LIKE ? OR
                b.author LIKE ? OR
                b.publisher LIKE ? OR
                c.name LIKE ?
            )`;
            const likeTerm = `%${searchTerm}%`;
            params.push(
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm
            );
        }

        query += ` ORDER BY br.due_date ASC`;

        const [rows] = await db.execute(query, params);
        return rows;
    },

    // FUNGSI BARU: Menampilkan riwayat buku yang sudah dikembalikan dengan filter pencarian
    findHistoryWithSearch: async (searchTerm) => {
        let query = `
            SELECT
                br.id AS borrowing_id,
                b.title,
                b.author,
                b.publisher,
                u.username,
                u.email,
                c.name AS category_name,
                br.borrow_date,
                br.return_date -- Ambil return_date, bukan due_date
            FROM borrowings br
            JOIN users u ON br.user_id = u.id
            JOIN books b ON br.book_id = b.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE br.return_date IS NOT NULL -- <-- SATU-SATUNYA PERBEDAAN UTAMA
        `;
        const params = [];

        if (searchTerm) {
            query += ` AND (
                u.username LIKE ? OR
                u.email LIKE ? OR
                b.title LIKE ? OR
                b.author LIKE ? OR
                b.publisher LIKE ? OR
                c.name LIKE ?
            )`;
            const likeTerm = `%${searchTerm}%`;
            params.push(
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm
            );
        }

        query += ` ORDER BY br.return_date DESC`; // Urutkan berdasarkan tanggal kembali

        const [rows] = await db.execute(query, params);
        return rows;
    },

    // FUNGSI BARU: Memproses pengembalian buku (dengan transaksi)
    processReturn: async (borrowingId) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Dapatkan book_id dari borrowingId
            const [borrowRows] = await connection.execute(
                "SELECT book_id FROM borrowings WHERE id = ? AND return_date IS NULL",
                [borrowingId]
            );
            if (borrowRows.length === 0) {
                throw new Error(
                    "Data peminjaman tidak ditemukan atau buku sudah dikembalikan."
                );
            }
            const bookId = borrowRows[0].book_id;

            // 2. Update tanggal pengembalian di tabel borrowings
            await connection.execute(
                "UPDATE borrowings SET return_date = CURDATE() WHERE id = ?",
                [borrowingId]
            );

            // 3. Tambah stok buku di tabel books
            await Book.increaseStock(bookId, connection);

            // 4. Jika semua berhasil, commit transaksi
            await connection.commit();
            return { success: true };
        } catch (error) {
            // 5. Jika ada error, batalkan semua perubahan
            await connection.rollback();
            console.error("Transaction Error in processReturn:", error);
            return { success: false, error: error.message };
        } finally {
            // 6. Selalu lepaskan koneksi
            connection.release();
        }
    },

    // FUNGSI BARU: Menghitung buku yang sedang dipinjam oleh user
    countActiveByUser: async (userId, options = {}) => {
        const { searchTerm } = options;
        let query = `
            SELECT COUNT(*) AS total
            FROM borrowings br
            JOIN books b ON br.book_id = b.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE br.user_id = ? AND br.return_date IS NULL
        `;
        const params = [userId];

        if (searchTerm) {
            // ... (logika pencarian tanggal dan teks sama seperti findActiveByUser)
            const likeTerm = `%${searchTerm}%`;
            const searchNumber = parseInt(searchTerm);
            query += ` AND (`;
            const searchConditions = [
                `b.title LIKE ?`,
                `b.author LIKE ?`,
                `b.publisher LIKE ?`,
                `c.name LIKE ?`,
                `MONTHNAME(br.borrow_date) LIKE ?`,
                `MONTHNAME(br.due_date) LIKE ?`,
            ];
            params.push(
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm
            );
            if (!isNaN(searchNumber)) {
                searchConditions.push(
                    `DAY(br.borrow_date) = ?`,
                    `MONTH(br.borrow_date) = ?`,
                    `YEAR(br.borrow_date) = ?`,
                    `DAY(br.due_date) = ?`,
                    `MONTH(br.due_date) = ?`,
                    `YEAR(br.due_date) = ?`
                );
                params.push(
                    searchNumber,
                    searchNumber,
                    searchNumber,
                    searchNumber,
                    searchNumber,
                    searchNumber
                );
            }
            query += searchConditions.join(" OR ") + `)`;
        }

        const [rows] = await db.execute(query, params);
        return rows[0].total;
    },

    // FUNGSI BARU: Menghitung riwayat peminjaman user
    countHistoryByUser: async (userId, options = {}) => {
        const { searchTerm } = options;
        let query = `
            SELECT COUNT(*) AS total
            FROM borrowings br
            JOIN books b ON br.book_id = b.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE br.user_id = ? AND br.return_date IS NOT NULL
        `;
        const params = [userId];

        if (searchTerm) {
            // ... (logika pencarian tanggal dan teks sama seperti findHistoryByUser)
            const likeTerm = `%${searchTerm}%`;
            const searchNumber = parseInt(searchTerm);
            query += ` AND (`;
            const searchConditions = [
                `b.title LIKE ?`,
                `b.author LIKE ?`,
                `b.publisher LIKE ?`,
                `c.name LIKE ?`,
                `MONTHNAME(br.borrow_date) LIKE ?`,
                `MONTHNAME(br.return_date) LIKE ?`,
            ];
            params.push(
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm,
                likeTerm
            );
            if (!isNaN(searchNumber)) {
                searchConditions.push(
                    `DAY(br.borrow_date) = ?`,
                    `MONTH(br.borrow_date) = ?`,
                    `YEAR(br.borrow_date) = ?`,
                    `DAY(br.return_date) = ?`,
                    `MONTH(br.return_date) = ?`,
                    `YEAR(br.return_date) = ?`
                );
                params.push(
                    searchNumber,
                    searchNumber,
                    searchNumber,
                    searchNumber,
                    searchNumber,
                    searchNumber
                );
            }
            query += searchConditions.join(" OR ") + `)`;
        }

        const [rows] = await db.execute(query, params);
        return rows[0].total;
    },

    // FUNGSI BARU: Cek apakah user sedang meminjam buku spesifik
    isCurrentlyBorrowed: async (userId, bookId) => {
        const [rows] = await db.execute(
            "SELECT id FROM borrowings WHERE user_id = ? AND book_id = ? AND return_date IS NULL LIMIT 1",
            [userId, bookId]
        );
        return rows.length > 0; // Return true jika sedang dipinjam, false jika tidak
    },

        // FUNGSI BARU: Mengambil semua riwayat untuk laporan PDF, diurutkan berdasarkan nama user
    findAllHistorySortedByUsername: async () => {
        const query = `
            SELECT
                b.title,
                b.author,
                u.username,
                u.email,
                br.borrow_date,
                br.return_date
            FROM borrowings br
            JOIN users u ON br.user_id = u.id
            JOIN books b ON br.book_id = b.id
            WHERE br.return_date IS NOT NULL
            ORDER BY u.username ASC, br.return_date DESC
        `;
        // Urutkan berdasarkan username, lalu tanggal kembali untuk setiap user

        const [rows] = await db.execute(query);
        return rows;
    },

        // FUNGSI BARU: Mengambil semua peminjaman AKTIF untuk laporan PDF, diurutkan berdasarkan nama user
    findAllActiveSortedByUsername: async () => {
        const query = `
            SELECT
                b.title,
                b.author,
                u.username,
                u.email,
                br.borrow_date,
                br.due_date
            FROM borrowings br
            JOIN users u ON br.user_id = u.id
            JOIN books b ON br.book_id = b.id
            WHERE br.return_date IS NULL
            ORDER BY u.username ASC, br.due_date ASC
        `;
        // Urutkan berdasarkan username, lalu jatuh tempo untuk setiap user

        const [rows] = await db.execute(query);
        return rows;
    },
};

module.exports = Borrowing;
