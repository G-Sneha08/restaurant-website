const pool = require('./server/config/db');

async function seed() {
    try {
        const menuItems = [
            ['Margherita Pizza', 'Classic tomato sauce, fresh mozzarella, and basil.', 12.99, 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80', 'Main'],
            ['Truffle Pasta', 'Creamy pasta with black truffle oil and parmesan.', 18.50, 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&w=800&q=80', 'Main'],
            ['Grilled Salmon', 'Fresh Atlantic salmon with roasted vegetables.', 24.00, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80', 'Main'],
            ['Caesar Salad', 'Crispy romaine with garlic croutons and dressing.', 9.50, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80', 'Starters'],
            ['Chocolate Lava Cake', 'Warm chocolate cake with a gooey center.', 8.00, 'https://images.unsplash.com/photo-1624353365286-3f8d62adda51?auto=format&fit=crop&w=800&q=80', 'Desserts']
        ];

        for (const item of menuItems) {
            await pool.query(
                'INSERT INTO menu (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
                item
            );
        }

        console.log('Database seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seed();
