// ADD TO CART
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

    alert("Item added to cart");

    updateNavbar();

  } catch (err) {

    console.error("Add cart error:", err);

  }

}

// ================= LOAD CART =================
async function loadCart() {

    try {

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            document.getElementById("empty-msg").style.display = "block";
            return;
        }

        const token = localStorage.getItem("token");

        const res = await fetch(`${window.API_BASE_URL}/cart`, {
            headers: {
                "Authorization": token ? `Bearer ${token}` : ""
            }
        });

        const data = await res.json();

        const tbody = document.getElementById("cart-items");
        const table = document.getElementById("cart-table");
        const emptyMsg = document.getElementById("empty-msg");
        const totalPriceEl = document.getElementById("total-price");

        if (!tbody) return;

        tbody.innerHTML = "";

        if (!data.success || data.cart.length === 0) {

            table.style.display = "none";
            emptyMsg.style.display = "block";
            totalPriceEl.innerText = "₹0";

            return;

        }

        table.style.display = "table";
        emptyMsg.style.display = "none";

        let total = 0;

        data.cart.forEach(item => {

            const price = item.price || 0;
            const subtotal = price * item.quantity;
            total += subtotal;

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${item.item_name}</td>

                <td>₹${price}</td>

                <td>

                    <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
                        −
                    </button>

                    <span style="margin:0 10px;">${item.quantity}</span>

                    <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
                        +
                    </button>

                </td>

                <td>₹${subtotal.toFixed(2)}</td>

                <td>
                    <button onclick="removeItem(${item.id})" class="btn-remove">
                        🗑
                    </button>
                </td>
            `;

            tbody.appendChild(row);

        });

        totalPriceEl.innerText = `₹${total}`;

    } catch (err) {

        console.error("Cart load error:", err);

    }

}



//
// ================= UPDATE QUANTITY =================
//
async function updateQuantity(cartId, quantity) {

    if (quantity < 1) return;

    try {

        const token = localStorage.getItem("token");

        await fetch(`${window.API_BASE_URL}/cart/${cartId}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : ""
            },

            body: JSON.stringify({ quantity })

        });

        loadCart();
        updateNavbar();

    } catch (err) {

        console.error("Update quantity error:", err);

    }

}



//
// ================= REMOVE ITEM =================
//
async function removeItem(cartId) {

    try {

        const token = localStorage.getItem("token");

        await fetch(`${window.API_BASE_URL}/cart/${cartId}`, {

            method: "DELETE",

            headers: {
                "Authorization": token ? `Bearer ${token}` : ""
            }

        });

        loadCart();
        updateNavbar();

    } catch (err) {

        console.error("Delete item error:", err);

    }

}



//
// ================= PAGE LOAD =================
//
document.addEventListener("DOMContentLoaded", () => {

    loadCart();

});