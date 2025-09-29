const Category = require('../models/categoryModel');

// Menampilkan semua kategori (Read)
exports.listCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        // Nanti kita akan membuat view khusus untuk ini, contoh: 'admin/categories/index'
        res.render('admin/categories/index', { 
            categories,
            user: req.session.user, // Kirim data user ke view
            title: 'Manajemen Kategori' 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Menampilkan form tambah kategori
exports.getCreatePage = (req, res) => {
    res.render('admin/categories/create', {
        user: req.session.user,
        title: 'Tambah Kategori'
    });
};

// Menyimpan kategori baru (Create)
exports.postCreateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        await Category.create(name);
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat menyimpan data');
    }
};

// Menampilkan form edit kategori
exports.getEditPage = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Kategori tidak ditemukan');
        }
        res.render('admin/categories/edit', {
            category,
            user: req.session.user,
            title: 'Edit Kategori'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan pada server');
    }
};

// Mengupdate kategori (Update)
exports.postUpdateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        await Category.update(id, name);
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        res.status(500).send('Terjadi kesalahan saat mengupdate data');
    }
};

// Menghapus kategori (Delete)
exports.postDeleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.remove(id);
        res.redirect('/admin/categories');
    } catch (error) {
        console.error(error);
        // Tangani error jika kategori masih digunakan oleh buku (jika tidak di-set ON DELETE SET NULL)
        res.status(500).send('Gagal menghapus kategori. Pastikan tidak ada buku yang menggunakan kategori ini.');
    }
};