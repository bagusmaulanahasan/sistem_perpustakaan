const express = require("express");
const path = require("path");
const session = require("express-session");
const expressLayouts = require("express-ejs-layouts");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const categoryRoutes = require("./src/routes/categoryRoutes");
const bookRoutes = require("./src/routes/bookRoutes");
const memberRoutes = require("./src/routes/memberRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(expressLayouts);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24,
        },
    })
);

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

app.use("/", authRoutes);
app.use("/admin/books", bookRoutes);
app.use("/", memberRoutes);
app.use("/admin", adminRoutes);


app.get("/", (req, res) => {
    if (req.session.isLoggedIn) {
        if (req.session.user.role === "admin") {
            return res.redirect("/admin/books");
        }
        return res.redirect("/katalog");
    }
    res.redirect("/login");
});

app.get("/books", (req, res) => {
    res.redirect("/katalog");
});

app.use("/member", memberRoutes);

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
