function updateNavbar() {
    const user = JSON.parse(localStorage.getItem('user'));
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Use current page layout or standardize
    const isDashboard = window.location.pathname.includes('admin.html');
    if (isDashboard) return;

    const cart = JSON.parse(localStorage.getItem('restaurant_cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);

    const authLinks = user ? `
        <li><a href="orders.html">Orders</a></li>
        ${user.role === 'admin' ? '<li><a href="admin.html">Admin</a></li>' : ''}
        <li><button onclick="logout()" class="btn btn-outline" style="padding: 5px 15px; margin-left:10px;">Logout</button></li>
    ` : `
        <li><a href="login.html" class="btn btn-outline" style="padding: 8px 16px;">Login</a></li>
    `;

    nav.innerHTML = `
        <a href="index.html" class="logo">LUMINA DINE</a>
        <ul class="nav-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="menu.html">Menu</a></li>
            <li><a href="cart.html" id="cart-link">Cart <span id="cart-count">(${count})</span></a></li>
            <li><a href="index.html#footer">Contact</a></li>
            ${authLinks}
        </ul>
    `;
}
async function loadImage(query, elementId) {
    try {
        const res = await fetch(`/api/image?query=${query}`);
        const data = await res.json();

        if (data.image) {
            document.getElementById(elementId).src = data.image;
        } else {
            document.getElementById(elementId).src = "https://via.placeholder.com/300";
        }

    } catch (err) {
        console.error("Image Load Error:", err);
    }
}

// Load images automatically
window.onload = function () {
    loadImage("Paneer Tikka Indian food", "paneerTikkaImg");
    loadImage("Crispy Corn appetizer", "crispyCornImg");
    loadImage("Paneer Butter Masala curry", "paneerButterMasalaImg");
    loadImage("Cold Coffee drink aesthetic", "coldCoffeeImg");
    loadImage("Rasmalai dessert Indian", "rasmalaiImg");
};
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Minimal global script for navbar logic across simple pages
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
