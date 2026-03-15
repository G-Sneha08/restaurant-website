// js/cart.js

// -------------------------------
// CONFIG
// -------------------------------
const API_BASE_URL = "https://restaurant-backend-cli2.onrender.com/api"; // Backend API URL
const USER_ID = 1; // Replace with dynamic logged-in user ID

// -------------------------------
// ADD TO CART (used in menu.html)
// -------------------------------
async function addToCart(menu_item_id, quantity = 1) {
    try {
        const res = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menu_item_id, quantity, user_id: USER_ID })
        });
        const data = await res.json();
        if (data.success) {
            alert("Item added to cart!");
            updateNavbar();
            if (document.getElementById('cart-items')) loadCart(); // refresh cart page if on cart.html
        } else {
            alert(data.message || "Failed to add item");
        }
    } catch (err) {
        console.error("Add to cart fetch error:", err);
        alert("Failed to add item to cart");
    }
}

// Add event listeners for Add to Cart buttons in menu.html
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        addToCart(id);
    });
});

// -------------------------------
// LOAD CART (cart.html)
// -------------------------------
async function loadCart() {
    try {
        const res = await fetch(`${API_BASE_URL}/cart/${USER_ID}`);
        const data = await res.json();

        const tbody = document.getElementById('cart-items');
        const table = document.getElementById('cart-table');
        const emptyMsg = document.getElementById('empty-msg');
        const totalPriceEl = document.getElementById('total-price');
        const footerActions = document.getElementById('cart-footer-actions');

        if (!data.success || data.cart.length === 0) {
            table.style.display = 'none';
            footerActions.style.display = 'none';
            emptyMsg.style.display = 'block';
            totalPriceEl.innerText = '₹0';
            return;
        }

        table.style.display = 'table';
        footerActions.style.display = 'block';
        emptyMsg.style.display = 'none';

        tbody.innerHTML = data.cart.map(item => `
            <tr>
                <td>${item.item_name}</td>
                <td>₹${item.price}</td>
                <td>
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    ${item.quantity}
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                    <button onclick="deleteCartItem(${item.id})" class="btn-remove">🗑️</button>
                </td>
            </tr>
        `).join('');

        totalPriceEl.innerText = `₹${data.totalPrice}`;
        updateNavbar();
    } catch (err) {
        console.error("Load cart error:", err);
    }
}

// -------------------------------
// UPDATE QUANTITY
// -------------------------------
async function updateCartQuantity(cartId, quantity) {
    if (quantity < 1) return;
    try {
        const res = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });
        const data = await res.json();
        if (data.success) loadCart();
        else alert(data.message);
    } catch (err) {
        console.error("Update cart error:", err);
    }
}

// -------------------------------
// DELETE ITEM
// -------------------------------
async function deleteCartItem(cartId) {
    try {
        const res = await fetch(`${API_BASE_URL}/cart/${cartId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) loadCart();
    } catch (err) {
        console.error("Delete cart item error:", err);
    }
}

// -------------------------------
// CLEAR FULL CART
// -------------------------------
async function clearFullCart() {
    try {
        const res = await fetch(`${API_BASE_URL}/cart`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) loadCart();
    } catch (err) {
        console.error("Clear cart error:", err);
    }
}

// -------------------------------
// CHECKOUT
// -------------------------------
async function checkoutCart() {
    try {
        const res = await fetch(`${API_BASE_URL}/cart/checkout`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            alert("Order placed successfully! Order ID: " + data.orderId);
            loadCart();
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error("Checkout error:", err);
    }
}

// -------------------------------
// UPDATE NAVBAR CART COUNT
// -------------------------------
async function updateNavbar() {
    try {
        const res = await fetch(`${API_BASE_URL}/cart/${USER_ID}`);
        const data = await res.json();
        const countEl = document.getElementById('cart-count');
        if (data.success) {
            const totalItems = data.cart.reduce((sum, item) => sum + item.quantity, 0);
            if (countEl) countEl.innerText = `(${totalItems})`;
        }
    } catch (err) {
        console.error("Navbar update error:", err);
    }
}

// -------------------------------
// INIT CART PAGE
// -------------------------------
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cart-items')) loadCart();
    updateNavbar();
});