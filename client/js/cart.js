// ================= ADD TO CART =================
async function addToCart(id) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${window.API_BASE_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify({
        menu_item_id: id,
        quantity: 1
      })
    });

    const data = await res.json();

    if (data.success) {
      alert("Item added to cart");
      if (typeof updateNavbar === "function") {
        updateNavbar();
      }
    } else {
      alert(data.message || "Failed to add item");
    }
  } catch (err) {
    console.error("Add cart error:", err);
    alert("Error adding item to cart");
  }
}

// ================= LOAD CART =================
async function loadCart() {
  const tbody = document.getElementById("cart-items");
  const table = document.getElementById("cart-table");
  const emptyMsg = document.getElementById("empty-msg");
  const totalPriceEl = document.getElementById("total-price");
  const footerActions = document.getElementById("cart-footer-actions");

  if (!tbody || !table) return;

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${window.API_BASE_URL}/cart`, {
      headers: {
        "Authorization": token ? `Bearer ${token}` : ""
      }
    });

    const data = await res.json();
    tbody.innerHTML = "";

    if (!data.success || !data.cart || data.cart.length === 0) {
      if (table) table.style.display = "none";
      if (emptyMsg) emptyMsg.style.display = "block";
      if (footerActions) footerActions.style.display = "none";
      if (totalPriceEl) totalPriceEl.innerText = "₹0";
      return;
    }

    if (table) table.style.display = "table";
    if (emptyMsg) emptyMsg.style.display = "none";
    if (footerActions) footerActions.style.display = "block";

    let total = 0;

    data.cart.forEach(item => {
      const price = item.price || 0;
      const subtotal = price * item.quantity;
      total += subtotal;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${item.item_name || "Item"}</td>
        <td>₹${price}</td>
        <td>
          <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
          <span style="margin:0 10px;">${item.quantity}</span>
          <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
        </td>
        <td>₹${subtotal.toFixed(2)}</td>
        <td>
          <button onclick="removeItem(${item.id})" class="btn-remove">🗑</button>
        </td>
      `;

      tbody.appendChild(row);
    });

    if (totalPriceEl) {
      totalPriceEl.innerText = `₹${total.toFixed(2)}`;
    }

  } catch (err) {
    console.error("Cart load error:", err);
  }
}

// ================= UPDATE QUANTITY =================
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
    if (typeof updateNavbar === "function") {
      updateNavbar();
    }
  } catch (err) {
    console.error("Update quantity error:", err);
  }
}

// ================= REMOVE ITEM =================
async function removeItem(cartId) {
  if (!confirm("Are you sure you want to remove this item?")) return;
  try {
    const token = localStorage.getItem("token");
    await fetch(`${window.API_BASE_URL}/cart/${cartId}`, {
      method: "DELETE",
      headers: {
        "Authorization": token ? `Bearer ${token}` : ""
      }
    });

    loadCart();
    if (typeof updateNavbar === "function") {
      updateNavbar();
    }
  } catch (err) {
    console.error("Delete item error:", err);
  }
}

// ================= CLEAR CART =================
async function clearFullCart() {
  if (!confirm("Are you sure you want to clear your cart?")) return;
  try {
    const token = localStorage.getItem("token");
    await fetch(`${window.API_BASE_URL}/cart`, {
      method: "DELETE",
      headers: {
        "Authorization": token ? `Bearer ${token}` : ""
      }
    });

    loadCart();
    if (typeof updateNavbar === "function") {
      updateNavbar();
    }
  } catch (err) {
    console.error("Clear cart error:", err);
  }
}

// ================= CHECKOUT =================
async function checkoutCart() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to checkout!");
        window.location.href = "login.html";
        return;
    }

    if (!confirm("Proceed to checkout?")) return;

    try {
        const res = await fetch(`${window.API_BASE_URL}/cart/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();

        if (data.success) {
            alert(data.message || "Order placed successfully!");
            window.location.href = "orders.html";
        } else {
            alert(data.message || "Checkout failed");
        }
    } catch (err) {
        console.error("Checkout error:", err);
        alert("Checkout failed. Please try again.");
    }
}

// Global exposure
window.updateQuantity = updateQuantity;
window.removeItem = removeItem;
window.checkoutCart = checkoutCart;
window.clearFullCart = clearFullCart;

// ================= PAGE LOAD =================
document.addEventListener("DOMContentLoaded", () => {
  loadCart();
});