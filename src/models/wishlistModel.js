const db = require("../config/database");

const Wishlist = {
    add: async (userId, bookId) => {
        const [result] = await db.execute(
            "INSERT IGNORE INTO `wishlists` (`user_id`, `book_id`) VALUES (?, ?)",
            [userId, bookId]
        );
        return result.affectedRows;
    },

    findByUser: async (userId, options = {}) => {
        const { searchTerm } = options;

        let query = `
            SELECT 
                b.id,
                b.title,
                b.author,
                b.publisher,
                b.cover_image_url,
                c.name as category_name
            FROM wishlists w
            JOIN books b ON w.book_id = b.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE w.user_id = ?
        `;
        const params = [userId];

        if (searchTerm) {
            query += ` AND (
                b.title LIKE ? OR
                b.author LIKE ? OR
                b.publisher LIKE ? OR
                c.name LIKE ?
            )`;
            const likeTerm = `%${searchTerm}%`;
            params.push(likeTerm, likeTerm, likeTerm, likeTerm);
        }

        query += ` ORDER BY w.created_at DESC`;

        const [rows] = await db.execute(query, params);
        return rows;
    },

    remove: async (userId, bookId) => {
        const [result] = await db.execute(
            "DELETE FROM `wishlists` WHERE `user_id` = ? AND `book_id` = ?",
            [userId, bookId]
        );
        return result.affectedRows;
    },

    countByUser: async (userId, options = {}) => {
        const { searchTerm } = options;
        let query = `
            SELECT COUNT(*) AS total
            FROM wishlists w
            JOIN books b ON w.book_id = b.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE w.user_id = ?
        `;
        const params = [userId];

        if (searchTerm) {
            query += ` AND (b.title LIKE ? OR b.author LIKE ? OR b.publisher LIKE ? OR c.name LIKE ?)`;
            const likeTerm = `%${searchTerm}%`;
            params.push(likeTerm, likeTerm, likeTerm, likeTerm);
        }

        const [rows] = await db.execute(query, params);
        return rows[0].total;
    },

    check: async (userId, bookId) => {
        const [rows] = await db.execute(
            "SELECT id FROM wishlists WHERE user_id = ? AND book_id = ? LIMIT 1",
            [userId, bookId]
        );
        return rows.length > 0;
    },
};

module.exports = Wishlist;
