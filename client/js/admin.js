// ================= ADMIN DASHBOARD LOGIC =================

document.addEventListener("DOMContentLoaded", () => {
    // Auth Check
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || user.role !== 'admin' || !token) {
        alert("Access Denied! Admin only.");
        window.location.href = "login.html";
        return;
    }

    document.getElementById('admin-name').innerText = user.name;

    // Load Initial Data
    loadStats();
    loadRecentOrders();

    // Navigation Logic
    const navItems = document.querySelectorAll('.sidebar-nav li[data-section]');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            switchSection(section);
        });
    });

    // View All button logic
    document.querySelectorAll('[data-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            switchSection(btn.getAttribute('data-target'));
        });
    });
});

function switchSection(sectionId) {
    // Update Sidebar
    document.querySelectorAll('.sidebar-nav li').forEach(li => li.classList.remove('active'));
    const activeLi = document.querySelector(`.sidebar-nav li[data-section="${sectionId}"]`);
    if (activeLi) activeLi.classList.add('active');

    // Update Content
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(`${sectionId}-section`).classList.add('active');

    // Update Title
    document.getElementById('section-title').innerText = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);

    // Refresh Data if needed
    if (sectionId === 'orders') loadOrders();
    if (sectionId === 'bookings') loadBookings();
    if (sectionId === 'dashboard') {
        loadStats();
        loadRecentOrders();
    }
}

// ================= STATS =================
async function loadStats() {
    try {
        const data = await apiRequest('/admin/stats');
        if (data.success) {
            document.getElementById('stat-total-orders').innerText = data.totalOrders;
            document.getElementById('stat-total-bookings').innerText = data.totalBookings;
            document.getElementById('stat-total-revenue').innerText = `₹${data.totalRevenue.toLocaleString()}`;
            document.getElementById('stat-today-orders').innerText = data.todayOrders;
        }
    } catch (err) {
        console.error("Stats load failed", err);
    }
}

// ================= ORDERS =================
async function loadRecentOrders() {
    try {
        const data = await apiRequest('/admin/orders');
        if (data.success) {
            const tbody = document.querySelector('#recent-orders-table tbody');
            const recent = data.orders.slice(0, 5); // Just top 5
            
            if (recent.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found</td></tr>';
                return;
            }

            tbody.innerHTML = recent.map(o => `
                <tr>
                    <td>#${o.id}</td>
                    <td>${o.user_name}</td>
                    <td title="${o.item_name}">${truncate(o.item_name, 25)}</td>
                    <td>₹${o.total_amount}</td>
                    <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error("Recent orders failed", err);
    }
}

async function loadOrders() {
    const tbody = document.querySelector('#all-orders-table tbody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Loading orders...</td></tr>';
    
    try {
        const data = await apiRequest('/admin/orders');
        if (data.success) {
            if (data.orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No orders available</td></tr>';
                return;
            }

            tbody.innerHTML = data.orders.map(o => `
                <tr>
                    <td>#${o.id}</td>
                    <td>${o.user_name}</td>
                    <td>${o.item_name}</td>
                    <td>₹${o.total_amount}</td>
                    <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
                    <td>
                        <select class="status-select" onchange="updateOrderStatus(${o.id}, this.value)">
                            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Error loading orders</td></tr>';
    }
}

async function updateOrderStatus(id, status) {
    try {
        const data = await apiRequest(`/admin/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        if (data.success) {
            // alert("Status updated!");
            loadOrders(); // Refresh table
        }
    } catch (err) {
        alert("Failed to update status");
    }
}

// ================= BOOKINGS =================
async function loadBookings() {
    const tbody = document.querySelector('#all-bookings-table tbody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading bookings...</td></tr>';

    try {
        const data = await apiRequest('/admin/bookings');
        if (data.success) {
            if (data.bookings.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No bookings available</td></tr>';
                return;
            }

            tbody.innerHTML = data.bookings.map(b => `
                <tr>
                    <td>#${b.id}</td>
                    <td>${b.customer_name || b.user_account_name}</td>
                    <td>
                        <div style="font-size:0.8rem;">
                            ${b.customer_email || 'N/A'}<br>
                            ${b.customer_phone || 'N/A'}
                        </div>
                    </td>
                    <td>${new Date(b.date).toLocaleDateString()} at ${b.time}</td>
                    <td>${b.guests}</td>
                    <td><span class="badge badge-${b.status.toLowerCase()}">${b.status}</span></td>
                    <td>
                        <select class="status-select" onchange="updateBookingStatus(${b.id}, this.value)">
                            <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Cancelled" ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Error loading bookings</td></tr>';
    }
}

async function updateBookingStatus(id, status) {
    try {
        const data = await apiRequest(`/admin/bookings/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        if (data.success) {
            loadBookings();
        }
    } catch (err) {
        alert("Failed to update status");
    }
}

// ================= UTILS =================
function truncate(str, n) {
    return (str.length > n) ? str.substr(0, n - 1) + '&hellip;' : str;
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}
