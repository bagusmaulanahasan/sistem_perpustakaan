const db = require('../config/database');
const Book = require('./bookModel'); // Impor Book model untuk akses increaseStoc

const Borrowing = {
    // Membuat catatan peminjaman baru
    create: async (userId, bookId, connection) => {
        // Asumsi durasi pinjam adalah 14 hari
        const borrowDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(borrowDate.getDate() + 14);

        const sql = 'INSERT INTO borrowings (user_id, book_id, borrow_date, due_date) VALUES (?, ?, ?, ?)';
        
        // Menggunakan koneksi yang di-passing untuk transaction
        await (connection || db).execute(sql, [userId, bookId, borrowDate, dueDate]);
    },

    // Menampilkan buku yang sedang dipinjam oleh user
    findActiveByUser: async (userId) => {
        const [rows] = await db.execute(`
            SELECT b.title, b.author, br.borrow_date, br.due_date
            FROM borrowings br
            JOIN books b ON br.book_id = b.id
            WHERE br.user_id = ? AND br.return_date IS NULL
            ORDER BY br.due_date ASC
        `, [userId]);
        return rows;
    },

    // Menampilkan riwayat buku yang sudah dikembalikan oleh user
    findHistoryByUser: async (userId) => {
        const [rows] = await db.execute(`
            SELECT b.title, b.author, br.borrow_date, br.return_date
            FROM borrowings br
            JOIN books b ON br.book_id = b.id
            WHERE br.user_id = ? AND br.return_date IS NOT NULL
            ORDER BY br.return_date DESC
        `, [userId]);
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
            params.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
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
            params.push(likeTerm, likeTerm, likeTerm, likeTerm, likeTerm, likeTerm);
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
            const [borrowRows] = await connection.execute('SELECT book_id FROM borrowings WHERE id = ? AND return_date IS NULL', [borrowingId]);
            if (borrowRows.length === 0) {
                throw new Error('Data peminjaman tidak ditemukan atau buku sudah dikembalikan.');
            }
            const bookId = borrowRows[0].book_id;

            // 2. Update tanggal pengembalian di tabel borrowings
            await connection.execute('UPDATE borrowings SET return_date = CURDATE() WHERE id = ?', [borrowingId]);

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
    }
};


module.exports = Borrowing;