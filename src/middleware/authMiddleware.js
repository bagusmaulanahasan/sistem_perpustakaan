exports.isLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect("/login");
    }
    next();
};

exports.isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).send("Akses ditolak: Anda bukan admin.");
    }
    next();
};

exports.isAnggota = (req, res, next) => {
    if (req.session.user && req.session.user.role === "anggota") {
        return next();
    }

    res.redirect("/admin");
};
