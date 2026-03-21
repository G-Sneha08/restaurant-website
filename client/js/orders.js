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
    const clearBtn = document.getElementById('clear-orders-btn');
    if (!list) return;

    try {
        const responseData = await apiRequest('/orders');
        
        // Support both direct array (legacy) and successful object response
        const orders = Array.isArray(responseData) ? responseData : (responseData?.orders || []);

        if (loading) loading.style.display = 'none';

        if (!orders || orders.length === 0) {
            list.innerHTML = `
                <div class="empty-orders">
                    <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" alt="Empty State" class="empty-icon">
                    <p>No orders yet — your next delicious experience is just a click away.</p>
                    <a href="menu.html" class="btn btn-primary" style="margin-top:10px;">Start Your Journey</a>
                </div>`;
            if (clearBtn) clearBtn.style.display = 'none';
            return;
        }

        if (clearBtn) clearBtn.style.display = 'block';

        list.innerHTML = orders.map(order => `
            <div class="card" style="padding: 25px; display:flex; flex-direction:column; justify-content:space-between; border: 1px solid #f0f0f0;">
                <div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <span style="font-size:0.8rem; color:var(--text-light); font-weight:600;">ORDER #${order.id}</span>
                        <span class="badge badge-${order.status.toLowerCase()}">${order.status}</span>
                    </div>
                    <h3 style="margin: 15px 0 5px; font-size:1.1rem; line-height:1.4;">${order.item_name}</h3>
                    <p style="font-size:0.85rem; color:var(--text-light);"><i class="far fa-calendar-alt"></i> ${new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                
                <div style="margin-top:25px; padding-top:15px; border-top:1px solid #f9f9f9; display:flex; justify-content:space-between; align-items:center;">
                    <p style="font-weight:700; font-size:1.2rem; color:var(--secondary);">₹${parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                    <button onclick="viewOrderDetails(${order.id})" class="btn btn-primary btn-sm" style="padding: 10px 20px;">
                        Details
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Load orders error:", err);
        if (loading) loading.innerHTML = `<p style="grid-column: 1 / -1; color:#ff4d4d;">Failed to load your orders. Please try again.</p>`;
    }
}

function viewOrderDetails(id) {
    window.location.href = `order-details.html?orderId=${id}`;
}

async function clearOrders() {
    if (!confirm("Are you absolutely sure you want to clear your entire order history? This action cannot be undone.")) return;

    try {
        const data = await apiRequest('/orders', { method: 'DELETE' });
        if (data.success) {
            alert(data.message || "Your history has been cleared.");
            loadOrders(); // Refresh UI
        }
    } catch (err) {
        console.error("Clear orders frontend error:", err);
        // User requested throw new Error(await res.text()) logic which is inside apiRequest now
        alert(`Failed to clear orders: ${err.message}`);
    }
}

document.addEventListener('DOMContentLoaded', loadOrders);
