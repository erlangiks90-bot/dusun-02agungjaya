let cart = [];
let produk = [];

async function loadProduk() {
    let res = await fetch("/produk");
    produk = await res.json();

    let list = document.getElementById("produkList");
    list.innerHTML = "";

    produk.forEach(p => {
        list.innerHTML += `
        <li>
            ${p.nama} | Rp ${p.harga} | Stok: ${p.stok}
            <button onclick="addCart(${p.id})">+ beli</button>
        </li>
        `;
    });
}

// TAMBAH PRODUK
function addProduk() {
    let nama = document.getElementById("nama").value;
    let harga = document.getElementById("harga").value;
    let stok = document.getElementById("stok").value;

    fetch("/produk", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ nama, harga, stok })
    }).then(loadProduk);
}

// MASUK KERANJANG
function addCart(id) {
    let item = produk.find(p => p.id == id);

    if (item.stok <= 0) {
        alert("Stok habis!");
        return;
    }

    cart.push(item);
    renderCart();
}

// RENDER KERANJANG
function renderCart() {
    let list = document.getElementById("cartList");
    list.innerHTML = "";

    let total = 0;

    cart.forEach(c => {
        total += c.harga;
        list.innerHTML += `
            <li>${c.nama} - Rp ${c.harga}</li>
        `;
    });

    document.getElementById("total").innerText = total;
}

// BAYAR + KURANG STOK
function bayar() {
    let total = cart.reduce((a,b)=>a+b.harga,0);
    let bayar = Number(document.getElementById("bayar").value);
    let kembali = bayar - total;

    // KURANG STOK
    cart.forEach(item => {
        fetch("/kurang-stok", {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ id: item.id, qty: 1 })
        });
    });

    // SIMPAN TRANSAKSI
    fetch("/transaksi", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ cart, total, bayar, kembali })
    });

    // STRUK
    let struk = "=== STRUK BELANJA ===<br>";

    cart.forEach(c => {
        struk += `${c.nama} - Rp ${c.harga}<br>`;
    });

    struk += `
    <hr>
    TOTAL: ${total}<br>
    BAYAR: ${bayar}<br>
    KEMBALI: ${kembali}<br>
    `;

    document.getElementById("struk").innerHTML = struk;

    alert("Transaksi berhasil!");

    cart = [];
    renderCart();
}

loadProduk();