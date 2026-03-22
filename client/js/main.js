// ================= NAVBAR =================
async function updateNavbar() {
    const user = JSON.parse(localStorage.getItem('user'));
    const nav = document.querySelector('nav');
    if (!nav) return;

    const isDashboard = window.location.pathname.includes('admin.html');
    if (isDashboard) return;

    let count = 0;

    // Fetch cart from backend if use API_BASE_URL
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${window.API_BASE_URL}/cart`, {
            headers: {
                "Authorization": token ? `Bearer ${token}` : ""
            }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.cart)) {
            count = data.cart.reduce((sum, item) => sum + item.quantity, 0);
        }
    } catch (err) {
        console.error("Failed to fetch cart count:", err);
    }

    const authLinks = user ? `
        <li><a href="orders.html">Orders</a></li>
        ${user.role === 'admin' ? '<li><a href="admin.html">Admin</a></li>' : ''}
        <li>
            <button onclick="logout()" class="btn btn-outline" style="padding:5px 15px;margin-left:10px;">Logout</button>
        </li>
    ` : `
        <li><a href="login.html" class="btn btn-outline" style="padding:8px 16px;">Login</a></li>
    `;

    nav.innerHTML = `
        <a href="index.html" class="logo">LUMINA DINE</a>
        <ul class="nav-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="menu.html">Menu</a></li>
            <li><a href="cart.html" id="cart-link">
                Cart <span id="cart-count">(${count})</span>
            </a></li>
            <li><a href="index.html#footer">Contact</a></li>
            ${authLinks}
        </ul>
    `;
}

// ================= ADD TO CART LISTENER =================
document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('add-to-cart')) {
        const id = e.target.getAttribute('data-id');
        if (id) {
            addToCart(id);
        }
    }
});

// ================= LOAD MENU IMAGES =================
async function loadMenuImages() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/images`);
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

// ================= SHOW TOAST =================
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

window.showToast = showToast;

// ================= ADD TO CART =================
async function addToCart(menu_item_id, btn = null) {
    const token = localStorage.getItem('token');
    
    // Check if item is already being added
    if (btn && btn.classList.contains('adding')) return;
    
    if (btn) btn.classList.add('adding');

    try {
        const res = await fetch(`${window.API_BASE_URL}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : ""
            },
            body: JSON.stringify({ menu_item_id, quantity: 1 })
        });

        const data = await res.json();
        if (data.success) {
            showToast(data.message || "Item added to your cart!");
            updateNavbar();

            // Dynamic Button Change
            if (btn) {
                btn.innerHTML = '<i class="fas fa-shopping-cart"></i> View Cart';
                btn.classList.remove('btn-primary', 'adding');
                btn.classList.add('btn-view-cart');
                btn.onclick = (e) => {
                    e.stopPropagation();
                    window.location.href = "cart.html";
                };
            }
        } else {
            showToast(data.message || "Failed to add item to cart.", 'error');
            if (btn) btn.classList.remove('adding');
        }
    } catch (err) {
        console.error("Add to cart error:", err);
        showToast("Error connecting to server.", 'error');
        if (btn) btn.classList.remove('adding');
    }
}

window.addToCart = addToCart;

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavbar();
    window.location.href = "index.html";
}

window.logout = logout;

// ================= PAGE LOAD =================
document.addEventListener("DOMContentLoaded", () => {
    updateNavbar();
    loadMenuImages();
});