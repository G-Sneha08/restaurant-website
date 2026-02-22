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

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Minimal global script for navbar logic across simple pages
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
