// Cart Management System using localStorage

const initCart = () => {
    if (!localStorage.getItem('restaurant_cart')) {
        localStorage.setItem('restaurant_cart', JSON.stringify([]));
    }
    updateCartCount();
};

const addToCart = (id, name, price, image) => {
    let cart = JSON.parse(localStorage.getItem('restaurant_cart')) || [];

    const existingItemIndex = cart.findIndex(item => item.id === id);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    localStorage.setItem('restaurant_cart', JSON.stringify(cart));
    updateCartCount();

    alert('Item added to cart successfully!');
};

const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('restaurant_cart')) || [];
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.innerText = `(${count})`;
    }
};

document.addEventListener('DOMContentLoaded', initCart);

// Export for use in other scripts
window.addToCart = addToCart;
window.updateCartCount = updateCartCount;
async function checkout() {
    const token = localStorage.getItem("token");
    const cart = JSON.parse(localStorage.getItem('restaurant_cart')) || [];

    if (!token) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    try {
        const response = await fetch("/api/orders/checkout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ cartItems: cart })
        });

        const data = await response.json();

        if (response.ok) {
            alert("🎉 Order placed successfully!");
            localStorage.setItem('restaurant_cart', JSON.stringify([]));
            window.location.reload();
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Checkout failed");
    }
}