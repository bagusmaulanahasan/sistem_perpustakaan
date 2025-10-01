// src/models/userModel.js
const db = require('../config/database');

const User = {
    // Mencari user berdasarkan email
    findByEmail: async (email) => {
        const [rows] = await db.execute(
            'SELECT * FROM `users` WHERE `email` = ?',
            [email]
        );
        return rows[0];
    },

    // Membuat user baru
    create: async (username, email, password) => {
        const [result] = await db.execute(
            'INSERT INTO `users` (`username`, `email`, `password`, `role`) VALUES (?, ?, ?, ?)',
            [username, email, password, 'anggota'] // Role otomatis 'anggota' saat registrasi
        );
        return result.insertId;
    },

    // Mencari user berdasarkan ID (opsional, berguna nanti)
    findById: async (id) => {
        const [rows] = await db.execute(
            'SELECT * FROM `users` WHERE `id` = ?',
            [id]
        );
        return rows[0];
    }
};

module.exports = User;