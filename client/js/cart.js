// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {
    loadCart();
});


// ================= ADD TO CART =================
async function addToCart(id) {

    try {

        await fetch(`${window.API_BASE_URL}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: window.USER_ID,
                menu_item_id: id,
                quantity: 1
            })
        });

        updateNavbar();

    } catch (err) {
        console.error("Add to cart error:", err);
    }

}


// ================= LOAD CART =================
async function loadCart() {

    try {

        const res = await fetch(`${window.API_BASE_URL}/cart/${window.USER_ID}`);
        const data = await res.json();

        const tbody = document.getElementById("cart-items");
        const table = document.getElementById("cart-table");
        const emptyMsg = document.getElementById("empty-msg");
        const totalPrice = document.getElementById("total-price");

        if (!tbody) return;

        tbody.innerHTML = "";

        if (!data.success || data.cart.length === 0) {

            table.style.display = "none";
            emptyMsg.style.display = "block";
            totalPrice.innerText = "₹0";

            return;
        }

        table.style.display = "table";
        emptyMsg.style.display = "none";

        data.cart.forEach(item => {

            const name = item.item_name || "Menu Item";
            const price = item.price || 0;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${name}</td>
                <td>₹${price}</td>
                <td>${item.quantity}</td>
                <td>₹${(price * item.quantity).toFixed(2)}</td>
                <td>
                    <button onclick="removeItem(${item.id})">Remove</button>
                </td>
            `;

            tbody.appendChild(row);

        });

        totalPrice.innerText = `₹${data.totalPrice}`;

        updateNavbar();

    } catch (err) {

        console.error("Cart load error:", err);

    }

}


// ================= REMOVE ITEM =================
async function removeItem(id) {

    try {

        await fetch(`${window.API_BASE_URL}/cart/${id}`, {
            method: "DELETE"
        });

        loadCart();
        updateNavbar();

    } catch (err) {

        console.error("Remove item error:", err);

    }

}