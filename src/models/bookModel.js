const db = require("../config/database");

const Book = {
    create: async (bookData) => {
        const {
            title,
            author,
            publisher,
            publication_year,
            stock,
            category_id,
            cover_image_url,
        } = bookData;
        const [result] = await db.execute(
            "INSERT INTO books (title, author, publisher, publication_year, stock, category_id, cover_image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                title,
                author,
                publisher,
                publication_year,
                stock,
                category_id,
                cover_image_url,
            ]
        );
        return result.insertId;
    },

    findById: async (id, connection) => {
        const [rows] = await (connection || db).execute(
            `
            SELECT b.*, c.name AS category_name
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.id = ?
        `,
            [id]
        );
        return rows[0];
    },

    update: async (id, bookData) => {
        const {
            title,
            author,
            publisher,
            publication_year,
            stock,
            category_id,
            cover_image_url,
        } = bookData;
        const [result] = await db.execute(
            `UPDATE books SET 
                title = ?, author = ?, publisher = ?, publication_year = ?, 
                stock = ?, category_id = ?, cover_image_url = ?
            WHERE id = ?`,
            [
                title,
                author,
                publisher,
                publication_year,
                stock,
                category_id,
                cover_image_url,
                id,
            ]
        );
        return result.affectedRows;
    },

    remove: async (id) => {
        const [result] = await db.execute("DELETE FROM books WHERE id = ?", [
            id,
        ]);
        return result.affectedRows;
    },

    decreaseStock: async (bookId, connection) => {
        const sql =
            "UPDATE books SET stock = stock - 1 WHERE id = ? AND stock > 0";
        const [result] = await (connection || db).execute(sql, [bookId]);
        return result.affectedRows;
    },

    increaseStock: async (bookId, connection) => {
        const sql = "UPDATE books SET stock = stock + 1 WHERE id = ?";
        await (connection || db).execute(sql, [bookId]);
    },

    findAll: async (options = {}) => {
        const { searchTerm, categoryId } = options;
        let query = `
        SELECT b.*, c.name AS category_name
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
    `;
        const params = [];
        const conditions = [];

        if (searchTerm) {
            conditions.push(
                `(b.title LIKE ? OR b.author LIKE ? OR b.publisher LIKE ? OR c.name LIKE ?)`
            );
            const likeTerm = `%${searchTerm}%`;
            params.push(likeTerm, likeTerm, likeTerm, likeTerm);
        }

        if (categoryId) {
            conditions.push(`b.category_id = ?`);
            params.push(categoryId);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(" AND ");
        }

        query += ` ORDER BY b.title ASC`;
        const [rows] = await db.execute(query, params);
        return rows;
    },

    countAll: async (options = {}) => {
        const { searchTerm, categoryId } = options;
        let query = `
            SELECT COUNT(*) AS total 
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
        `;
        const params = [];
        const conditions = [];

        if (searchTerm) {
            conditions.push(
                `(b.title LIKE ? OR b.author LIKE ? OR b.publisher LIKE ? OR c.name LIKE ?)`
            );
            const likeTerm = `%${searchTerm}%`;
            params.push(likeTerm, likeTerm, likeTerm, likeTerm);
        }

        if (categoryId) {
            conditions.push(`b.category_id = ?`);
            params.push(categoryId);
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(" AND ");
        }

        const [rows] = await db.execute(query, params);
        return rows[0].total;
    },

    findByCategory: async (categoryId, options = {}) => {
        const { searchTerm } = options;
        let query = `
        SELECT b.*, c.name AS category_name
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.category_id = ?
    `;
        const params = [categoryId];

        if (searchTerm) {
            query += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.publisher LIKE ?)`;
            const likeTerm = `%${searchTerm}%`;
            params.push(likeTerm, likeTerm, likeTerm);
        }

        query += ` ORDER BY b.title ASC`;
        const [rows] = await db.execute(query, params);
        return rows;
    },
};

module.exports = Book;
