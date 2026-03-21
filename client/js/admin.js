// ================= MODAL ADMIN LOGIC =================
function openAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) {
        modal.style.display = 'block';
        window.loadAdminBookings();
    }
}

function closeAdminModal() {
    const modal = document.getElementById('adminModal');
    if (modal) modal.style.display = 'none';
}

window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;

async function loadAdminBookings() {
    const tbody = document.getElementById('adminBookingsTable');
    if (!tbody) return;
    
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px;">Loading bookings...</td></tr>';

    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
            if (data.bookings.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px;">No bookings found</td></tr>';
                return;
            }

            tbody.innerHTML = data.bookings.map(b => `
                <tr style="border-bottom: 1px solid #333;">
                    <td style="padding:12px;">#${b.id}</td>
                    <td style="padding:12px;">${b.customer_name || 'N/A'}</td>
                    <td style="padding:12px;">${b.customer_email || 'N/A'}</td>
                    <td style="padding:12px;">${b.customer_phone || 'N/A'}</td>
                    <td style="padding:12px;">${new Date(b.date).toLocaleDateString()}</td>
                    <td style="padding:12px;">${b.time}</td>
                    <td style="padding:12px; text-align:center;">${b.guests}</td>
                    <td style="padding:12px;">
                        <span class="badge badge-${b.status.toLowerCase()}">${b.status}</span>
                    </td>
                    <td style="padding:12px;">
                        <select onchange="updateBookingStatus(${b.id}, this.value)" style="background:#333; color:white; border:1px solid #444; padding:5px; border-radius:4px;">
                            <option value="Pending" ${b.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Confirmed" ${b.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="Completed" ${b.status === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Cancelled" ${b.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        } else {
             tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:20px; color:red;">${data.message || 'Error loading bookings'}</td></tr>`;
        }
    } catch (err) {
        console.error("Error loading bookings:", err);
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px; color:red;">Connection error</td></tr>';
    }
}

async function updateBookingStatus(id, status) {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (data.success) {
            loadAdminBookings(); // Refresh UI
        } else {
            alert(data.message || "Failed to update status");
        }
    } catch (err) {
        alert("Server error updating status");
    }
}

window.loadAdminBookings = loadAdminBookings;
window.updateBookingStatus = updateBookingStatus;

// Original admin page logic (keeping for backward compatibility or if dedicated page is still used)
document.addEventListener("DOMContentLoaded", () => {
    // Only run if on admin.html
    if (!window.location.pathname.includes('admin.html')) return;
    
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
