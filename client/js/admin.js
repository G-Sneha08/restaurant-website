// =======================
// Admin panel functions
// =======================

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

if (!token || user?.role !== 'admin') {
    window.location.href = 'login.html';
}

function showTab(tab) {
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelectorAll('.admin-sidebar a').forEach(a => a.classList.remove('active'));
    document.getElementById(tab + '-tab').classList.add('active');
    
    // Find the link that was clicked
    const links = document.querySelectorAll('.admin-sidebar nav a');
    links.forEach(a => {
        if (a.getAttribute('onclick')?.includes(tab)) {
            a.classList.add('active');
        }
    });

    if (tab === 'orders') loadAdminOrders();
    if (tab === 'menu') loadAdminMenu();
    if (tab === 'users') loadAdminUsers();
}

async function loadAdminOrders() {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/orders`, { headers: { 'Authorization': `Bearer ${token}` } });
        const orders = await res.json();
        const list = document.getElementById('admin-orders-list');
        if (!list) return;
        
        list.innerHTML = orders.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${o.user_name}</td>
                <td>₹${o.total_price}</td>
                <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
                <td>
                    <select onchange="updateStatus(${o.id}, this.value)">
                        <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${o.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Failed to load admin orders", err);
    }
}

async function updateStatus(id, status) {
    try {
        await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status })
        });
        loadAdminOrders();
    } catch (err) {
        console.error("Failed to update status", err);
    }
}

async function loadAdminMenu() {
    try {
        const res = await fetch(`${API_BASE_URL}/menu`);
        const menu = await res.json();
        const list = document.getElementById('admin-menu-list');
        if (!list) return;
        
        list.innerHTML = menu.map(m => `
            <tr>
                <td>${m.name}</td>
                <td>${m.category}</td>
                <td>₹${m.price}</td>
                <td>${m.available ? 'Available' : 'Sold Out'}</td>
                <td>
                    <button onclick="deleteMenu(${m.id})" style="color:red; background:none; border:none; cursor:pointer;">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Failed to load admin menu", err);
    }
}

async function deleteMenu(id) {
    if (confirm('Delete this item?')) {
        try {
            await fetch(`${API_BASE_URL}/admin/menu/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadAdminMenu();
        } catch (err) {
            console.error("Failed to delete menu item", err);
        }
    }
}

async function loadAdminUsers() {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: { 'Authorization': `Bearer ${token}` } });
        const users = await res.json();
        const list = document.getElementById('admin-users-list');
        if (!list) return;
        
        list.innerHTML = users.map(u => `
            <tr>
                <td>#${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>${new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (err) {
        console.error("Failed to load admin users", err);
    }
}

function showAddMenuModal() {
    const name = prompt('Item Name:');
    const price = prompt('Price:');
    const category = prompt('Category (e.g. Starters, Main Course, Beverages, Desserts):');
    const desc = prompt('Description:');

    if (name && price) {
        fetch(`${API_BASE_URL}/admin/menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name, price, category, description: desc })
        }).then(() => loadAdminMenu());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin-orders-list')) {
        loadAdminOrders();
    }
});

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}
