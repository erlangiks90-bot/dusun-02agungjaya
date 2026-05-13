```javascript id="serveronlinefull"
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// ================= PORT ONLINE =================
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ================= DATABASE SEMENTARA =================
let produk = [];
let transaksi = [];

// ================= USER LOGIN =================
const users = [
    {
        username: "admin",
        password: "123",
        role: "admin"
    },
    {
        username: "kasir",
        password: "123",
        role: "kasir"
    }
];

// ================= LOGIN =================
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    const user = users.find(
        u =>
            u.username === username &&
            u.password === password
    );

    if(user){

        res.json({
            success: true,
            role: user.role
        });

    }else{

        res.json({
            success: false,
            message: "Login gagal"
        });

    }

});

// ================= PRODUK =================

// GET PRODUK
app.get("/produk", (req, res) => {
    res.json(produk);
});

// TAMBAH PRODUK
app.post("/produk", (req, res) => {

    const data = {
        id: Date.now(),
        nama: req.body.nama,
        harga: Number(req.body.harga),
        stok: Number(req.body.stok)
    };

    produk.push(data);

    res.json({
        success: true,
        produk
    });

});

// HAPUS PRODUK
app.delete("/produk/:id", (req, res) => {

    const id = Number(req.params.id);

    produk = produk.filter(
        p => p.id !== id
    );

    res.json({
        success: true,
        produk
    });

});

// ================= TRANSAKSI =================

// SIMPAN TRANSAKSI
app.post("/transaksi", (req, res) => {

    const data = {
        id: Date.now(),
        cart: req.body.cart,
        total: req.body.total,
        bayar: req.body.bayar,
        kembali: req.body.kembali,
        waktu: new Date()
    };

    transaksi.push(data);

    // KURANGI STOK
    data.cart.forEach(item => {

        const p = produk.find(
            x => x.id === item.id
        );

        if(p){

            p.stok -= 1;

            if(p.stok < 0){
                p.stok = 0;
            }

        }

    });

    res.json({
        success: true
    });

});

// GET TRANSAKSI
app.get("/transaksi", (req, res) => {
    res.json(transaksi);
});

// ================= HOME =================
app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

// ================= SERVER ONLINE =================
app.listen(PORT, "0.0.0.0", () => {

    console.log("=================================");
    console.log("🔥 KASIR ERLANG TECNO ONLINE");
    console.log("🌍 SERVER RUNNING");
    console.log("🚀 PORT : " + PORT);
    console.log("=================================");

});
```
