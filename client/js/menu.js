// =======================
// Menu loading and rendering
// =======================

async function loadMenu() {
    try {
        const response = await fetch(`${API_BASE_URL}/menu`);
        const menuItems = await response.json();

        // Categorize items
        const starters = menuItems.filter(item => item.category === 'Starters');
        const mainCourse = menuItems.filter(item => item.category === 'Main Course');
        const beverages = menuItems.filter(item => item.category === 'Beverages');
        const desserts = menuItems.filter(item => item.category === 'Desserts');

        // This assumes the HTML has sections with specific IDs
        renderCategory(starters, 'starters');
        renderCategory(mainCourse, 'main-course');
        renderCategory(beverages, 'beverages');
        renderCategory(desserts, 'desserts');

    } catch (error) {
        console.error("Error loading menu:", error);
    }
}

function renderCategory(items, sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const grid = section.querySelector('.grid');
    if (!grid) return;

    if (items.length === 0) {
        grid.innerHTML = '<p>No items available in this category.</p>';
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="card">
            <img src="${item.image_url}" alt="${item.name}" class="card-img">
            <div class="card-body">
                <h3 class="card-title">${item.name}</h3>
                <p class="card-desc">${item.description}</p>
                <div class="card-footer">
                    <span class="card-price">₹${item.price}</span>
                    <button onclick="addToCart(${item.id}, '${item.name}', ${item.price}, '${item.image_url}')"
                        class="btn btn-primary btn-sm">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', loadMenu);
