// ================= NAVBAR =================
async function updateNavbar() {
    const user = JSON.parse(localStorage.getItem('user'));
    const nav = document.querySelector('nav');
    if (!nav) return;

    const isDashboard = window.location.pathname.includes('admin-dashboard.html');
    if (isDashboard) return;

    // Fetch cart count from server
    let count = 0;
    try {
        const res = await fetch(`${API_BASE_URL}/cart`);
        const data = await res.json();
        if (data.success) {
            count = data.cart.reduce((sum, item) => sum + item.quantity, 0);
        }
    } catch (err) { console.error("Error fetching cart count:", err); }

    const authLinks = user ? `
        <li><a href="orders.html">Orders</a></li>
        ${user.role === 'admin' ? '<li><a href="#" onclick="openAdminModal(); return false;">Admin Panel</a></li>' : ''}
        <li>
            <button onclick="logout()" class="btn btn-outline" style="padding:5px 15px;margin-left:10px;">Logout</button>
        </li>
    ` : `
        <li>
            <a href="login.html" class="btn btn-outline" style="padding:8px 16px;">Login</a>
        </li>
    `;

    nav.innerHTML = `
        <a href="index.html" class="logo">LUMINA DINE</a>
        <ul class="nav-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="menu.html">Menu</a></li>
            <li><a href="booking.html">Book Table</a></li>
            <li>
                <a href="cart.html" id="cart-link">
                    Cart <span id="cart-count">(${count})</span>
                </a>
            </li>
            <li><a href="index.html#footer">Contact</a></li>
            ${authLinks}
        </ul>
    `;
}

// ================= LOAD MENU IMAGES =================
async function loadMenuImages() {
    try {
        const response = await fetch(`${API_BASE_URL}/images`);
        const data = await response.json();

        if (data.success) {
            const images = data.images;
            const ids = {
                "Paneer Tikka": "paneerTikkaImg",
                "Crispy Corn": "crispyCornImg",
                "Paneer Butter Masala": "paneerButterMasalaImg",
                "Cold Coffee": "coldCoffeeImg",
                "Rasmalai": "rasmalaiImg"
            };

            for (const [name, id] of Object.entries(ids)) {
                const el = document.getElementById(id);
                if (el) el.src = images[name];
            }
        }
    } catch (error) {
        console.error("Error loading menu images:", error);
    }
}

// ================= ADD TO CART =================
function addToCart(itemId, name, price, image, quantity = 1) {
    let finalQty = (typeof name === 'number') ? name : quantity;
    if (typeof name === 'string' && arguments.length < 5) finalQty = 1;

    fetch(`${API_BASE_URL}/cart`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
            menu_item_id: itemId, 
            quantity: finalQty 
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Item added to cart!");
            updateNavbar(); // update cart count
        } else {
            alert(data.message || "Failed to add item.");
        }
    })
    .catch(err => console.error(err));
}

// Expose globally
window.addToCart = addToCart;

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("You have been logged out.");
    window.location.href = "login.html";
}

// ================= ADMIN MODAL =================
function openAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.style.display = 'block';
        if (typeof loadAdminBookings === 'function') {
            loadAdminBookings();
        }
    }
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.style.display = 'none';
}

window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;

// ================= PAGE LOAD =================
document.addEventListener("DOMContentLoaded", () => {
    updateNavbar();
    loadMenuImages();
});