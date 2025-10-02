const db = require("../config/database");

const User = {
    findByEmail: async (email) => {
        const [rows] = await db.execute(
            "SELECT * FROM `users` WHERE `email` = ?",
            [email]
        );
        return rows[0];
    },

    create: async (username, email, password) => {
        const [result] = await db.execute(
            "INSERT INTO `users` (`username`, `email`, `password`, `role`) VALUES (?, ?, ?, ?)",
            [username, email, password, "anggota"]
        );
        return result.insertId;
    },

    findById: async (id) => {
        const [rows] = await db.execute(
            "SELECT * FROM `users` WHERE `id` = ?",
            [id]
        );
        return rows[0];
    },

    updateProfile: async (id, username, email) => {
        const [result] = await db.execute(
            "UPDATE users SET username = ?, email = ? WHERE id = ?",
            [username, email, id]
        );
        return result.affectedRows;
    },

    updatePassword: async (id, hashedPassword) => {
        const [result] = await db.execute(
            "UPDATE users SET password = ? WHERE id = ?",
            [hashedPassword, id]
        );
        return result.affectedRows;
    },
};

module.exports = User;
