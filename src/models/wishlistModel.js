const db = require('../config/database');

const Wishlist = {
    // Menambahkan item ke wishlist
    add: async (userId, bookId) => {
        // Menggunakan INSERT IGNORE agar tidak error jika data sudah ada (karena UNIQUE key di DB)
        const [result] = await db.execute(
            'INSERT IGNORE INTO `wishlists` (`user_id`, `book_id`) VALUES (?, ?)',
            [userId, bookId]
        );
        return result.affectedRows;
    },

    // Menampilkan semua item di wishlist seorang user
    findByUser: async (userId) => {
        const [rows] = await db.execute(`
            SELECT 
                b.id,
                b.title,
                b.author,
                b.cover_image_url
            FROM wishlists w
            JOIN books b ON w.book_id = b.id
            WHERE w.user_id = ?
            ORDER BY w.created_at DESC
        `, [userId]);
        return rows;
    },

    // Menghapus item dari wishlist
    remove: async (userId, bookId) => {
        const [result] = await db.execute(
            'DELETE FROM `wishlists` WHERE `user_id` = ? AND `book_id` = ?',
            [userId, bookId]
        );
        return result.affectedRows;
    }
};

module.exports = Wishlist;