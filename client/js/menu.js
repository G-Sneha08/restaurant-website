// =======================
// Menu loading and rendering
// =======================

async function loadMenu() {
    try {
        console.log("Starting menu load...");
        // Use the global apiRequest helper for consistent logging/error handling
        const data = await window.apiRequest('/menu');
        
        // Items are in data.menu based on backend response structure
        const items = data.menu || [];
        console.log("Menu items loaded successfully:", items.length);

        // Categorize items
        const starters = items.filter(item => item.category === 'Starters');
        const mainCourse = items.filter(item => item.category === 'Main Course');
        const beverages = items.filter(item => item.category === 'Beverages');
        const desserts = items.filter(item => item.category === 'Desserts');

        // Render categories
        renderCategory(starters, 'starters');
        renderCategory(mainCourse, 'main-course');
        renderCategory(beverages, 'beverages');
        renderCategory(desserts, 'desserts');

    } catch (error) {
        console.error("Error loading menu:", error.message);
        // Show an error message to the user UI
        const grids = document.querySelectorAll('.grid');
        grids.forEach(grid => {
            grid.innerHTML = `<p class="error-msg">Failed to load menu: ${error.message}. Please try again later.</p>`;
        });
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
                    <button onclick="addToCart(${item.id}, this)"
                        class="btn btn-primary btn-sm add-to-cart">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', loadMenu);
