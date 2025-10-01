const db = require('../config/database');

const Book = {
    // Fungsi untuk membuat buku baru
    create: async (bookData) => {
        const { title, author, publisher, publication_year, stock, category_id, cover_image_url } = bookData;
        const [result] = await db.execute(
            'INSERT INTO books (title, author, publisher, publication_year, stock, category_id, cover_image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, author, publisher, publication_year, stock, category_id, cover_image_url]
        );
        return result.insertId;
    },

    // Fungsi untuk mencari buku berdasarkan ID
    findById: async (id, connection) => {
        const [rows] = await (connection || db).execute(`
            SELECT b.*, c.name AS category_name
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.id = ?
        `, [id]);
        return rows[0];
    },

    // Fungsi untuk update buku
    update: async (id, bookData) => {
        const { title, author, publisher, publication_year, stock, category_id, cover_image_url } = bookData;
        const [result] = await db.execute(
            `UPDATE books SET 
                title = ?, author = ?, publisher = ?, publication_year = ?, 
                stock = ?, category_id = ?, cover_image_url = ?
            WHERE id = ?`,
            [title, author, publisher, publication_year, stock, category_id, cover_image_url, id]
        );
        return result.affectedRows;
    },

    // Fungsi untuk menghapus buku
    remove: async (id) => {
        const [result] = await db.execute('DELETE FROM books WHERE id = ?', [id]);
        return result.affectedRows;
    },

    // Fungsi untuk mengurangi stok
    decreaseStock: async (bookId, connection) => {
        const sql = 'UPDATE books SET stock = stock - 1 WHERE id = ? AND stock > 0';
        const [result] = await (connection || db).execute(sql, [bookId]);
        return result.affectedRows;
    },

    // Fungsi untuk menambah stok
    increaseStock: async (bookId, connection) => {
        const sql = 'UPDATE books SET stock = stock + 1 WHERE id = ?';
        await (connection || db).execute(sql, [bookId]);
    },

    // Fungsi findAll yang sederhana (sebelum pagination)
    findAll: async () => {
        const [rows] = await db.execute(`
            SELECT b.*, c.name AS category_name
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            ORDER BY b.title ASC
        `);
        return rows;
    },

    // Fungsi findByCategory (untuk filter di katalog)
    findByCategory: async (categoryId) => {
        const [rows] = await db.execute(`
            SELECT b.*, c.name AS category_name
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.category_id = ?
            ORDER BY b.title ASC
        `, [categoryId]);
        return rows;
    },
};

module.exports = Book;