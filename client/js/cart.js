// Dependencies: API_BASE_URL, updateNavbar() from main.js

async function loadCart() {
    const tbody = document.getElementById('cart-items');
    if (!tbody) return;

    const table = document.getElementById('cart-table');
    const emptyMsg = document.getElementById('empty-msg');
    const footerActions = document.getElementById('cart-footer-actions');
    const totalPriceEl = document.getElementById('total-price');

    try {
        const res = await fetch(`${API_BASE_URL}/cart`);
        const data = await res.json();

        if (!data.success || !data.cart || data.cart.length === 0) {
            if (table) table.style.display = 'none';
            if (footerActions) footerActions.style.display = 'none';
            if (emptyMsg) emptyMsg.style.display = 'block';
            if (totalPriceEl) totalPriceEl.innerText = '₹0';
            return;
        }

        if (table) table.style.display = 'table';
        if (emptyMsg) emptyMsg.style.display = 'none';
        if (footerActions) footerActions.style.display = 'block';

        tbody.innerHTML = data.cart.map(item => `
            <tr>
                <td>
                    <div style="display:flex; align-items:center; gap:15px;">
                        <span>${item.item_name}</span>
                    </div>
                </td>
                <td>₹${item.price}</td>
                <td>
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    ${item.quantity}
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </td>
                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
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

// Update cart quantity
async function updateCartQuantity(cartId, quantity) {
    if (quantity < 1) return;
    try {
        const res = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: Number(quantity) })
        });
        const data = await res.json();
        if (data.success) {
            loadCart();
            if (typeof updateNavbar === 'function') updateNavbar();
        }
    } catch (err) { console.error("Update quantity error:", err); }
}

// Delete single cart item
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

// Checkout cart
async function checkoutCart() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to checkout!");
        window.location.href = "login.html";
        return;
    }

    if (!confirm("Proceed to checkout?")) return;

    try {
        const cartRes = await fetch(`${API_BASE_URL}/cart`);
        const cartData = await cartRes.json();

        if (!cartData.success || cartData.cart.length === 0) {
            alert("Cart is empty");
            return;
        }

        const res = await fetch(`${API_BASE_URL}/cart/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({}) // backend expects a JSON body
        });
        const data = await res.json();

        if (data.success) {
            alert(data.message);
            window.location.href = "orders.html";
        } else {
            alert(data.message || "Checkout failed");
        }
    } catch (err) {
        console.error("Checkout error:", err);
        alert("Checkout failed. Please try again.");
    }
}

// Clear entire cart
async function clearFullCart() {
    if (!confirm("Clear your cart?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/cart`, {
            method: 'DELETE'
        });
        const data = await res.json();
        if (data.success) {
            loadCart();
            if (typeof updateNavbar === 'function') updateNavbar();
        }
    } catch (err) { console.error("Clear cart error:", err); }
}

// Add item to cart (fixes 400 Bad Request)
async function addToCart(menuItemId) {
    try {
        const res = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                menu_item_id: Number(menuItemId),
                quantity: 1
            })
        });
        const data = await res.json();
        if (data.success) {
            alert("Item added to cart!");
            loadCart();
            if (typeof updateNavbar === 'function') updateNavbar();
        } else {
            console.error("Add to cart error:", data.message);
            alert("Failed to add item. Check console.");
        }
    } catch (err) {
        console.error("Add to cart fetch error:", err);
        alert("Error adding item to cart. Check console.");
    }
}

// Expose functions globally
window.updateCartQuantity = updateCartQuantity;
window.deleteCartItem = deleteCartItem;
window.checkoutCart = checkoutCart;
window.clearFullCart = clearFullCart;
window.addToCart = addToCart;

document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    // Bind add-to-cart buttons dynamically
    const buttons = document.querySelectorAll('.add-to-cart');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            addToCart(btn.dataset.id);
        });
    });
});