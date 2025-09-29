const db = require('../config/database');

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
    }
};

module.exports = Borrowing;