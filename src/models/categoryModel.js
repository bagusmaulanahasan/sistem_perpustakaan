const db = require("../config/database");

const Category = {
    create: async (name) => {
        const [result] = await db.execute(
            "INSERT INTO `categories` (`name`) VALUES (?)",
            [name]
        );
        return result.insertId;
    },

    findAll: async (options = {}) => {
        const { searchTerm } = options;
        let query = "SELECT * FROM `categories`";
        const params = [];

        if (searchTerm) {
            query += " WHERE `name` LIKE ?";
            params.push(`%${searchTerm}%`);
        }

        query += " ORDER BY `name` ASC";
        const [rows] = await db.execute(query, params);
        return rows;
    },

    countAll: async (options = {}) => {
        const { searchTerm } = options;
        let query = "SELECT COUNT(*) as total FROM `categories`";
        const params = [];

        if (searchTerm) {
            query += " WHERE `name` LIKE ?";
            params.push(`%${searchTerm}%`);
        }

        const [rows] = await db.execute(query, params);
        return rows[0].total;
    },

    findById: async (id) => {
        const [rows] = await db.execute(
            "SELECT * FROM `categories` WHERE `id` = ?",
            [id]
        );
        return rows[0];
    },

    update: async (id, name) => {
        const [result] = await db.execute(
            "UPDATE `categories` SET `name` = ? WHERE `id` = ?",
            [name, id]
        );
        return result.affectedRows;
    },

    remove: async (id) => {
        const [result] = await db.execute(
            "DELETE FROM `categories` WHERE `id` = ?",
            [id]
        );
        return result.affectedRows;
    },
};

module.exports = Category;
