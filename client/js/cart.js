// client/js/cart.js 
// ===================== CONFIG =====================
// Make sure config.js is loaded before this file
const USER_ID = 1; // Replace with dynamic user ID if login system is implemented

// ===================== CART OPERATIONS =====================

// Add item to cart
async function addToCart(menu_item_id, quantity = 1) {
    try {
        const data = await window.apiRequest('/cart', {
            method: 'POST',
            body: JSON.stringify({ menu_item_id, quantity })
        });

        if (data.success) {
            alert(data.message || "Item added to cart!");
            loadCart();          // Reload cart table
            updateNavbar();      // Update cart count in navbar
        }
    } catch (err) {
        console.error("Add to cart fetch error:", err);
        alert(err.message || "Failed to add item to cart");
    }
}

// Update cart item quantity
async function updateCartQuantity(cart_id, newQuantity) {
    if (newQuantity < 1) return; // Prevent zero or negative

    try {
        const data = await window.apiRequest(`/cart/${cart_id}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (data.success) {
            loadCart();
            updateNavbar();
        }
    } catch (err) {
        console.error("Update cart quantity error:", err);
        alert(err.message || "Failed to update quantity");
    }
}

// Delete single cart item
async function deleteCartItem(cart_id) {
    if (!confirm("Are you sure you want to remove this item?")) return;

    try {
        const data = await window.apiRequest(`/cart/${cart_id}`, { method: 'DELETE' });
        if (data.success) {
            loadCart();
            updateNavbar();
        }
    } catch (err) {
        console.error("Delete cart item error:", err);
        alert(err.message || "Failed to remove item");
    }
}

// Clear full cart
async function clearFullCart() {
    if (!confirm("Are you sure you want to clear the cart?")) return;

    try {
        const data = await window.apiRequest('/cart', { method: 'DELETE' });
        if (data.success) {
            loadCart();
            updateNavbar();
        }
    } catch (err) {
        console.error("Clear cart error:", err);
        alert(err.message || "Failed to clear cart");
    }
}

// Checkout cart
async function checkoutCart() {
    if (!confirm("Proceed to checkout?")) return;

    try {
        const data = await window.apiRequest('/cart/checkout', { method: 'POST' });
        if (data.success) {
            alert(data.message || "Order placed successfully!");
            loadCart();
            updateNavbar();
        }
    } catch (err) {
        console.error("Checkout error:", err);
        alert(err.message || "Failed to checkout");
    }
}

// ===================== LOAD CART =====================

async function loadCart() {
    try {
        const data = await window.apiRequest(`/cart`);

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

        totalPriceEl.innerText = `₹${data.totalPrice.toFixed(2)}`;

    } catch (err) {
        console.error("Load cart error:", err);
    }
}

// ===================== NAVBAR CART COUNT =====================

async function updateNavbar() {
    try {
        const data = await window.apiRequest(`/cart`);
        const cartCountEl = document.getElementById('cart-count');
        const count = data.cart ? data.cart.length : 0;
        if (cartCountEl) cartCountEl.innerText = `(${count})`;
    } catch (err) {
        console.error("Navbar update error:", err);
        if (document.getElementById('cart-count')) document.getElementById('cart-count').innerText = `(0)`;
    }
}

// ===================== ADD TO CART BUTTON EVENT =====================

document.addEventListener('DOMContentLoaded', () => {
    // Load cart when page opens
    loadCart();
    updateNavbar();

    // Attach Add to Cart buttons on menu.html dynamically
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.getAttribute('data-id'));
            addToCart(id);
        });
    });
});