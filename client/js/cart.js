// =======================
// Cart frontend using session_id based backend
// =======================

// Dependencies: API_BASE_URL, getSessionId(), updateNavbar() from main.js

async function loadCart() {
    const tbody = document.getElementById('cart-items');
    if (!tbody) return;

    const table = document.getElementById('cart-table');
    const emptyMsg = document.getElementById('empty-msg');
    const footerActions = document.getElementById('cart-footer-actions');
    const totalPriceEl = document.getElementById('total-price');

    try {
        const res = await fetch(`${API_BASE_URL}/cart?session_id=${getSessionId()}`);
        const data = await res.json();

        if (!data.success || !data.items || data.items.length === 0) {
            if (table) table.style.display = 'none';
            if (footerActions) footerActions.style.display = 'none';
            if (emptyMsg) emptyMsg.style.display = 'block';
            if (totalPriceEl) totalPriceEl.innerText = '₹0';
            return;
        }

        if (table) table.style.display = 'table';
        if (emptyMsg) emptyMsg.style.display = 'none';
        if (footerActions) footerActions.style.display = 'block';

        tbody.innerHTML = data.items.map(item => `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <img src="${item.image_url}" width="60" height="60" style="border-radius:10px; object-fit:cover;">
                        <span>${item.name}</span>
                    </div>
                </td>
                <td>₹${item.price}</td>
                <td>
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    ${item.quantity}
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </td>
                <td>₹${item.subtotal}</td>
                <td>
                    <button onclick="deleteCartItem(${item.id})" style="background:none;border:none;cursor:pointer;color:var(--primary)">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        if (totalPriceEl) totalPriceEl.innerText = `₹${data.totalPrice}`;

    } catch (err) {
        console.error("Load cart error:", err);
    }
}

async function updateCartQuantity(cartId, quantity) {
    if (quantity < 1) return;
    try {
        const res = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });
        const data = await res.json();
        if (data.success) {
            loadCart();
            if (typeof updateNavbar === 'function') updateNavbar();
        }
    } catch (err) { console.error("Update quantity error:", err); }
}

async function deleteCartItem(cartId) {
    if (!confirm("Remove item?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            loadCart();
            if (typeof updateNavbar === 'function') updateNavbar();
        }
    } catch (err) { console.error("Delete item error:", err); }
}

async function checkoutCart() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to checkout!");
        window.location.href = "login.html";
        return;
    }

    if (!confirm("Proceed to checkout?")) return;

    try {
        // Get items for checkout
        const cartRes = await fetch(`${API_BASE_URL}/cart?session_id=${getSessionId()}`);
        const cartData = await cartRes.json();

        if (!cartData.success || cartData.items.length === 0) {
            alert("Cart is empty");
            return;
        }

        const res = await fetch(`${API_BASE_URL}/orders/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cartItems: cartData.items })
        });
        const data = await res.json();

        if (data.success) {
            alert(data.message);
            // Clear cart for this session
            await fetch(`${API_BASE_URL}/cart?session_id=${getSessionId()}`, { method: 'DELETE' });
            window.location.href = "orders.html";
        } else {
            alert(data.message || "Checkout failed");
        }
    } catch (err) {
        console.error("Checkout error:", err);
        alert("Checkout failed. Please try again.");
    }
}

async function clearFullCart() {
    if (!confirm("Clear your cart?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/cart?session_id=${getSessionId()}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            loadCart();
            if (typeof updateNavbar === 'function') updateNavbar();
        }
    } catch (err) { console.error("Clear cart error:", err); }
}

// Global exposure
window.updateCartQuantity = updateCartQuantity;
window.deleteCartItem = deleteCartItem;
window.checkoutCart = checkoutCart;
window.clearFullCart = clearFullCart;

document.addEventListener('DOMContentLoaded', () => {
    loadCart();
});