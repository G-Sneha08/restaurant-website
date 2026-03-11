// =======================
// Cart frontend using backend
// =======================

const token = localStorage.getItem('token');

// Backend URL
const API_BASE_URL = "https://restaurant-website-489aafoff-g-sneha08s-projects.vercel.app/api";

// =======================
// Load Cart Page Items
// =======================
async function loadCart() {

    if (!token) {
        alert("Please login to view your cart!");
        window.location.href = "login.html";
        return;
    }

    try {

        const res = await fetch(`${API_BASE_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error(`Failed to fetch cart`);

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

            if (cartCountElement) cartCountElement.innerText = '(0)';
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
                        <button onclick="deleteItem(${item.id})" style="background:none;border:none;cursor:pointer;color:var(--primary)">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;

        }).join('');

        document.getElementById('total-price').innerText = `₹${total}`;

        if (cartCountElement) {
            const totalQty = data.items.reduce((sum, i) => sum + i.quantity, 0);
            cartCountElement.innerText = `(${totalQty})`;
        }

    } catch (err) {

        console.error(err);
        alert("Failed to load cart");

    }
}


// =======================
// Update Quantity
// =======================
async function updateQuantity(cartId, quantity) {

    if (quantity < 1) return;

    try {

        const res = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        loadCart();

    } catch (err) {

        console.error(err);
        alert(err.message);

    }
}


// =======================
// Delete Item
// =======================
async function deleteItem(cartId) {

    try {

        const res = await fetch(`${API_BASE_URL}/cart/${cartId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        loadCart();

    } catch (err) {

        console.error(err);
        alert(err.message);

    }
}


// =======================
// Checkout Cart
// =======================
async function checkout() {

    if (!confirm("Proceed to checkout?")) return;

    try {

        const res = await fetch(`${API_BASE_URL}/cart/checkout`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        alert(data.message);
        loadCart();

    } catch (err) {

        console.error(err);
        alert(err.message);

    }
}


// =======================
// Clear Cart
// =======================
async function clearCart() {

    if (!confirm("Are you sure you want to clear your cart?")) return;

    try {

        const res = await fetch(`${API_BASE_URL}/cart`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        loadCart();

    } catch (err) {

        console.error(err);
        alert(err.message);

    }
}


// =======================
// Add to Cart from Menu
// =======================
window.addToCart = async function (menu_id, name, price, image_url) {

    if (!token) {
        alert("Please login to add items to cart!");
        window.location.href = "login.html";
        return;
    }

    try {

        const res = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                menu_id,
                name,
                price,
                image_url,
                quantity: 1
            })
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        alert(`${name} added to cart!`);

        updateCartBadge();

    } catch (err) {

        console.error(err);
        alert(err.message);

    }

};


// =======================
// Update Cart Badge
// =======================
async function updateCartBadge() {

    if (!token) return;

    try {

        const res = await fetch(`${API_BASE_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = await res.json();

        const cartCountElement = document.getElementById('cart-count');

        if (cartCountElement) {

            const totalQty = data.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

            cartCountElement.innerText = `(${totalQty})`;

        }

    } catch (err) {

        console.error("Failed to update cart badge", err);

    }

}


// =======================
// Event Listeners
// =======================
window.addEventListener('DOMContentLoaded', () => {

    loadCart();
    updateCartBadge();

});

document.getElementById('checkout-btn')?.addEventListener('click', checkout);
document.getElementById('clear-cart-btn')?.addEventListener('click', clearCart);