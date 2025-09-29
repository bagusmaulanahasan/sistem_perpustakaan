const db = require('../config/database');

const Category = {
    create: async (name) => {
        const [result] = await db.execute(
            'INSERT INTO `categories` (`name`) VALUES (?)',
            [name]
        );
        return result.insertId;
    },

    findAll: async () => {
        const [rows] = await db.execute('SELECT * FROM `categories` ORDER BY `name` ASC');
        return rows;
    },

    findById: async (id) => {
        const [rows] = await db.execute('SELECT * FROM `categories` WHERE `id` = ?', [id]);
        return rows[0];
    },

    update: async (id, name) => {
        const [result] = await db.execute(
            'UPDATE `categories` SET `name` = ? WHERE `id` = ?',
            [name, id]
        );
        return result.affectedRows;
    },

    remove: async (id) => {
        // Hati-hati: Pastikan foreign key di tabel 'books' di-set ke ON DELETE SET NULL
        const [result] = await db.execute('DELETE FROM `categories` WHERE `id` = ?', [id]);
        return result.affectedRows;
    }
};

module.exports = Category;