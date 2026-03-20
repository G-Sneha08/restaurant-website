async function loadOrderDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');

    if (!orderId) {
        window.location.href = 'orders.html';
        return;
    }

    const itemsContainer = document.getElementById('items-list');
    const orderIdTitle = document.getElementById('order-id-title');
    const orderStatus = document.getElementById('order-status');
    const orderDate = document.getElementById('order-date');
    const orderTotal = document.getElementById('order-total');

    try {
        const data = await apiRequest(`/orders/${orderId}`);

        if (!data) throw new Error("Order not found");

        // Update Meta Info
        orderIdTitle.innerText = `Order #${data.id}`;
        orderStatus.innerText = data.status;
        orderStatus.className = `badge badge-${data.status.toLowerCase()}`;
        orderDate.innerHTML = `<i class="far fa-calendar-alt"></i> Placed on ${new Date(data.created_at).toLocaleString()}`;
        orderTotal.innerText = `₹${parseFloat(data.total_amount).toLocaleString('en-IN')}`;

        // Render Items
        if (data.items && data.items.length > 0) {
            itemsContainer.innerHTML = data.items.map(item => `
                <div class="item-row">
                    <div style="font-weight: 600; font-size: 1.1rem;">${item.item_name}</div>
                    <div style="color: var(--text-light);">₹${parseFloat(item.price).toLocaleString('en-IN')}</div>
                    <div style="font-weight: 500;">x${item.quantity}</div>
                    <div style="font-weight: 700; color: var(--secondary);">₹${(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}</div>
                </div>
            `).join('');
        } else {
            itemsContainer.innerHTML = `<p class="text-center" style="color:var(--text-light);">No items found for this order.</p>`;
        }

    } catch (err) {
        console.error("Load order details error:", err);
        itemsContainer.innerHTML = `
            <div class="text-center" style="padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size:3rem; color:#ff4d4d; margin-bottom:20px;"></i>
                <p>Unable to retrieve order details. Please ensure the Order ID is correct.</p>
                <a href="orders.html" class="btn btn-primary" style="margin-top:20px;">Return to History</a>
            </div>`;
    }
}

document.addEventListener('DOMContentLoaded', loadOrderDetails);
