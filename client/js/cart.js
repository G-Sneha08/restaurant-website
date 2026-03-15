// client/js/cart.js
const API_BASE_URL = "/api"; // relative path works on both local and Vercel

async function addToCart(menu_item_id, quantity = 1) {
    try {
        const res = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ menu_item_id, quantity })
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            loadCart();
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
        alert("Failed to add item.");
    }
}

async function loadCart() {
    const tbody = document.getElementById('cart-items');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE_URL}/cart`);
        const data = await res.json();
        if (!data.success || !data.cart.length) {
            tbody.innerHTML = "<tr><td colspan='5'>Cart is empty</td></tr>";
            return;
        }

        tbody.innerHTML = data.cart.map(item => `
            <tr>
                <td>${item.item_name}</td>
                <td>₹${item.price}</td>
                <td>
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity-1})">-</button>
                    ${item.quantity}
                    <button onclick="updateCartQuantity(${item.id}, ${item.quantity+1})">+</button>
                </td>
                <td>₹${(item.price*item.quantity).toFixed(2)}</td>
                <td>
                    <button onclick="deleteCartItem(${item.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (err) { console.error(err); }
}

async function updateCartQuantity(id, quantity) {
    if (quantity < 1) return;
    await fetch(`${API_BASE_URL}/cart/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ quantity })
    });
    loadCart();
}

async function deleteCartItem(id) {
    if (!confirm("Remove item?")) return;
    await fetch(`${API_BASE_URL}/cart/${id}`, { method: 'DELETE' });
    loadCart();
}

document.addEventListener('DOMContentLoaded', () => {
    loadCart();

    // Prevent double event listeners
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.replaceWith(newBtn);
        newBtn.addEventListener('click', () => addToCart(newBtn.dataset.id));
        newBtn.style.borderRadius = '6px';
    });
});