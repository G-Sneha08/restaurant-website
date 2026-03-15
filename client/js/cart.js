// ============================
// client/js/cart.js
// ============================

const API_BASE_URL = "https://restaurant-backend-cli2.onrender.com/api";

// ============================
// Add to Cart
// ============================
async function addToCart(menu_item_id, quantity = 1) {
    try {
        const res = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menu_item_id, quantity })
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message || 'Item added to cart');
            loadCart(); // Refresh cart after adding
        } else {
            alert(data.message || 'Failed to add item to cart');
        }
    } catch (err) {
        console.error("Add to cart error:", err);
        alert("Failed to add item to cart");
    }
}

// ============================
// Load Cart
// ============================
async function loadCart() {
    try {
        const res = await fetch(`${API_BASE_URL}/cart`);
        const data = await res.json();

        const tbody = document.getElementById('cart-items');
        const table = document.getElementById('cart-table');
        const emptyMsg = document.getElementById('empty-msg');
        const totalPriceEl = document.getElementById('total-price');
        const footerActions = document.getElementById('cart-footer-actions');

        if (!data.success || !data.cart || data.cart.length === 0) {
            if (table) table.style.display = 'none';
            if (footerActions) footerActions.style.display = 'none';
            if (emptyMsg) emptyMsg.style.display = 'block';
            if (totalPriceEl) totalPriceEl.innerText = '₹0';
            return;
        }

        if (table) table.style.display = 'table';
        if (footerActions) footerActions.style.display = 'block';
        if (emptyMsg) emptyMsg.style.display = 'none';

        tbody.innerHTML = data.cart.map(item => `
            <tr>
                <td>${item.item_name}</td>
                <td>₹${item.price}</td>
                <td>
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" class="cart-btn">-</button>
                    ${item.quantity}
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" class="cart-btn">+</button>
                </td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                    <button onclick="deleteCartItem(${item.id})" class="btn-remove">🗑️</button>
                </td>
            </tr>
        `).join('');

        if (totalPriceEl) totalPriceEl.innerText = `₹${data.totalPrice.toFixed(2)}`;
    } catch (err) {
        console.error("Load cart error:", err);
    }
}

// ============================
// Update Cart Quantity
// ============================
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
        else alert(data.message || "Failed to update quantity");
    } catch (err) {
        console.error("Update quantity error:", err);
    }
}

// ============================
// Delete Cart Item
// ============================
async function deleteCartItem(cartId) {
    if (!confirm("Remove this item from cart?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) loadCart();
        else alert(data.message || "Failed to remove item");
    } catch (err) {
        console.error("Delete item error:", err);
    }
}

// ============================
// Clear Full Cart
// ============================
async function clearFullCart() {
    if (!confirm("Clear your entire cart?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/cart`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) loadCart();
        else alert(data.message || "Failed to clear cart");
    } catch (err) {
        console.error("Clear cart error:", err);
    }
}

// ============================
// Checkout Cart
// ============================
async function checkoutCart() {
    if (!confirm("Proceed to checkout?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/cart/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message || "Order placed successfully");
            loadCart();
        } else {
            alert(data.message || "Checkout failed");
        }
    } catch (err) {
        console.error("Checkout error:", err);
        alert("Checkout failed. Please try again.");
    }
}

// ============================
// Initialize on DOM Load
// ============================
document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.style.borderRadius = '8px'; // slightly rounded corners
        btn.addEventListener('click', () => addToCart(btn.dataset.id));
    });
});

// ============================
// Expose functions globally
// ============================
window.addToCart = addToCart;
window.loadCart = loadCart;
window.updateCartQuantity = updateCartQuantity;
window.deleteCartItem = deleteCartItem;
window.clearFullCart = clearFullCart;
window.checkoutCart = checkoutCart;