const Category = require("../models/categoryModel");

exports.listCategories = async (req, res) => {
    try {
        const searchTerm = req.query.search || "";
        const options = { searchTerm };

        const categories = await Category.findAll(options);
        const totalCategories = await Category.countAll(options);

        res.render("admin/categories/index", {
            categories,
            title: "Manajemen Kategori",
            count: totalCategories,
            searchTerm,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.getCreatePage = (req, res) => {
    res.render("admin/categories/create", {
        user: req.session.user,
        title: "Tambah Kategori",
    });
};

exports.postCreateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        await Category.create(name);
        res.redirect("/admin/categories");
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan saat menyimpan data");
    }
};

exports.getEditPage = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send("Kategori tidak ditemukan");
        }
        res.render("admin/categories/edit", {
            category,
            user: req.session.user,
            title: "Edit Kategori",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan pada server");
    }
};

exports.postUpdateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        await Category.update(id, name);
        res.redirect("/admin/categories");
    } catch (error) {
        console.error(error);
        res.status(500).send("Terjadi kesalahan saat mengupdate data");
    }
};

exports.postDeleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.remove(id);
        res.redirect("/admin/categories");
    } catch (error) {
        console.error(error);

        res.status(500).send(
            "Gagal menghapus kategori. Pastikan tidak ada buku yang menggunakan kategori ini."
        );
    }
};
