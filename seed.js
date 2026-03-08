require('dotenv').config();
const mysql = require('mysql2/promise');

// Railway DB connection
const pool = mysql.createPool({
    host: process.env.crossover.proxy.rlwy.net,
    user: process.env.root,
    password: process.env.VgknVczRXKYYnbRoIVWRGwMwjOFgJfko,
    database: process.env.railway,
    port: process.env.DB_PORT
});

async function seed() {
    try {

        const menuItems = [

            // Starters
            ['Veg Spring Rolls','Crispy golden rolls stuffed with seasoned vegetables.',119,'https://images.pexels.com/photos/4001867/pexels-photo-4001867.jpeg','Starters'],
            ['Chicken 65','South Indian spicy deep fried chicken.',149,'https://images.pexels.com/photos/12916901/pexels-photo-12916901.jpeg','Starters'],
            ['Paneer Tikka','Grilled cottage cheese cubes marinated in Indian spices.',199,'images/panner-tikka.jpg','Starters'],
            ['French Fries','Classic salted crispy potato sticks.',79,'https://images.pexels.com/photos/115740/pexels-photo-115740.jpeg','Starters'],
            ['Garlic Bread','Oven baked bread with garlic butter.',89,'https://images.pexels.com/photos/13062441/pexels-photo-13062441.jpeg','Starters'],
            ['Crispy Corn','Golden fried sweet corn tossed with spices.',180,'images/crispy-corn.jpg','Starters'],

            // Main Course
            ['Paneer Butter Masala','Rich creamy tomato gravy with paneer cubes.',250,'images/panner-butter-masala.jpg','Main'],
            ['Chicken Biryani','Flavorful basmati rice with spiced chicken.',229,'https://images.pexels.com/photos/4439740/pexels-photo-4439740.jpeg','Main'],
            ['Veg Fried Rice','Stir fried rice with vegetables.',149,'https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg','Main'],
            ['Butter Naan','Soft Indian bread brushed with butter.',39,'https://images.pexels.com/photos/10337726/pexels-photo-10337726.jpeg','Main'],
            ['Dal Tadka','Yellow lentils tempered with spices.',139,'https://images.pexels.com/photos/4595313/pexels-photo-4595313.jpeg','Main'],
            ['Margherita Pizza','Classic Italian pizza with tomato and mozzarella.',149,'https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg','Main'],

            // Beverages
            ['Espresso','Strong black coffee.',59,'https://images.pexels.com/photos/131053/pexels-photo-131053.jpeg','Beverages'],
            ['Cappuccino','Coffee with steamed milk and froth.',79,'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg','Beverages'],
            ['Fresh Lime Soda','Refreshing fizzy lime drink.',49,'https://images.pexels.com/photos/4045205/pexels-photo-4045205.jpeg','Beverages'],
            ['Mango Shake','Thick creamy mango shake.',89,'https://images.pexels.com/photos/8211179/pexels-photo-8211179.jpeg','Beverages'],
            ['Cold Coffee','Chilled coffee blended with milk and ice cream.',120,'images/cold-coffee.jpg','Beverages'],
            ['Mineral Water','Pure bottled drinking water.',20,'https://images.pexels.com/photos/113734/pexels-photo-113734.jpeg','Beverages'],

            // Desserts
            ['Gulab Jamun','Milk balls soaked in sugar syrup.',49,'https://images.pexels.com/photos/11887844/pexels-photo-11887844.jpeg','Desserts'],
            ['Chocolate Brownie','Nutty chocolate fudge brownie.',119,'https://images.pexels.com/photos/45202/brownie-dessert-cake-sweet-45202.jpeg','Desserts'],
            ['Ice Cream Sundae','Vanilla scoops with nuts and syrup.',99,'https://images.pexels.com/photos/6025810/pexels-photo-6025810.jpeg','Desserts'],
            ['Rasmalai','Cottage cheese balls soaked in saffron milk.',150,'images/rasmalai.jpg','Desserts'],
            ['Cheesecake','New York style cheesecake.',119,'https://images.pexels.com/photos/3071821/pexels-photo-3071821.jpeg','Desserts'],
            ['Fruit Custard','Fresh fruits in creamy custard.',69,'https://images.pexels.com/photos/773724/pexels-photo-773724.jpeg','Desserts']

        ];

        // optional: clear table first
        await pool.query("DELETE FROM menu");

        for (const item of menuItems) {
            await pool.query(
                'INSERT INTO menu (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
                item
            );
        }

        console.log('✅ Menu items inserted into Railway database successfully!');
        process.exit();

    } catch (err) {
        console.error('❌ Error seeding database:', err);
        process.exit(1);
    }
}

seed();