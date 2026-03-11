// =======================
// Order history functions
// =======================

async function loadOrders() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const list = document.getElementById('orders-list');
    const loading = document.getElementById('loading');
    if (!list) return;

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const orders = await response.json();

        if (loading) loading.style.display = 'none';

        if (orders.length === 0) {
            list.innerHTML = '<p class="text-center">No orders found.</p>';
            return;
        }

        list.innerHTML = orders.map(order => `
            <div class="card" style="margin-bottom: 20px; padding: 20px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <h4 style="margin-bottom:5px;">Order #${order.id}</h4>
                        <p style="font-size:0.85rem; color:var(--text-light);">${new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <span class="badge badge-${order.status.toLowerCase()}">${order.status}</span>
                </div>
                <div style="margin-top:15px; display:flex; justify-content:space-between; align-items:flex-end;">
                    <p style="font-weight:600;">Total: ₹${order.total_price}</p>
                    <button onclick="viewOrderDetails(${order.id})" class="btn btn-outline" style="padding: 5px 15px; font-size:0.8rem;">View Details</button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        if (loading) loading.innerText = "Error loading orders.";
    }
}

async function viewOrderDetails(id) {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_BASE_URL}/orders/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        const items = data.items.map(i => `${i.name} (x${i.quantity}) - ₹${i.price}`).join('\n');
        alert(`Order #${id} Items:\n\n${items}\n\nTotal: ₹${data.total_price}`);
    } catch (err) {
        console.error("Failed to load order details", err);
        alert("Failed to load order details");
    }
}

document.addEventListener('DOMContentLoaded', loadOrders);
