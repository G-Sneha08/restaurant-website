// =======================
// Cart frontend using backend
// =======================

const token = localStorage.getItem('token'); // JWT token

// Load cart items from backend
async function loadCart() {
    if (!token) {
        alert("Please login to view your cart!");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch('https://restaurant-backend-cli2.onrender.com/api/cart', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch cart");

        const data = await res.json();

        const table = document.getElementById('cart-table');
        const tbody = document.getElementById('cart-items');
        const emptyMsg = document.getElementById('empty-msg');
        const footerActions = document.getElementById('cart-footer-actions');
        const cartCountElement = document.getElementById('cart-count');

        if (!data.items || data.items.length === 0) {
            table.style.display = 'none';
            footerActions.style.display = 'none';
            emptyMsg.style.display = 'block';
            cartCountElement.innerText = '(0)';
            document.getElementById('total-price').innerText = '₹0';
            return;
        }

        table.style.display = 'table';
        emptyMsg.style.display = 'none';
        footerActions.style.display = 'block';

        let total = 0;
        tbody.innerHTML = data.items.map(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            return `
                <tr>
                    <td>
                        <div style="display:flex; align-items:center; gap:15px;">
                            <img src="${item.image_url}" width="60" height="60" style="border-radius:10px; object-fit:cover;">
                            <span>${item.name}</span>
                        </div>
                    </td>
                    <td>₹${item.price}</td>
                    <td>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        ${item.quantity}
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </td>
                    <td>₹${subtotal}</td>
                    <td>
                        <button onclick="deleteItem(${item.id})" style="background:none; border:none; cursor:pointer; color:var(--primary)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        document.getElementById('total-price').innerText = `₹${total}`;
        cartCountElement.innerText = `(${data.items.reduce((sum, i) => sum + i.quantity, 0)})`;

    } catch (err) {
        console.error(err);
        alert("Failed to load cart");
    }
}

// Update quantity of a cart item
async function updateQuantity(cartId, quantity) {
    if (quantity < 1) return;

    try {
        const res = await fetch(`https://restaurant-backend-cli2.onrender.com/api/cart/${cartId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity })
        });

        const data = await res.json();
        if (!res.ok) alert(data.message);
        else loadCart();

    } catch (err) {
        console.error(err);
        alert("Failed to update quantity");
    }
}

// Delete a cart item
async function deleteItem(cartId) {
    try {
        const res = await fetch(`https://restaurant-backend-cli2.onrender.com/api/cart/${cartId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) alert(data.message);
        else loadCart();

    } catch (err) {
        console.error(err);
        alert("Failed to delete item");
    }
}

// Checkout cart
async function checkout() {
    if (!confirm("Proceed to checkout?")) return;

    try {
        const res = await fetch('https://restaurant-backend-cli2.onrender.com/api/cart/checkout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) alert(data.message);
        else {
            alert(data.message);
            loadCart();
        }

    } catch (err) {
        console.error(err);
        alert("Checkout failed");
    }
}

// Clear all cart items
async function clearCart() {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    try {
        const res = await fetch('https://restaurant-backend-cli2.onrender.com/api/cart', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();
        if (!res.ok) alert(data.message);
        else loadCart();

    } catch (err) {
        console.error(err);
        alert("Failed to clear cart");
    }
}

// Event listeners
document.getElementById('checkout-btn').addEventListener('click', checkout);
document.getElementById('clear-cart-btn').addEventListener('click', clearCart);
window.addEventListener('DOMContentLoaded', loadCart);