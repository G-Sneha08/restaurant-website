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
      const price = parseFloat(item.price) || 0;
      const subtotal = price * item.quantity;
      total += subtotal;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td data-label="ItemSelection">
          <div style="display:flex; align-items:center; gap:15px;">
            <div style="font-weight:600; font-size:1.1rem;">${item.item_name || "Exquisite Dish"}</div>
          </div>
        </td>
        <td data-label="Price" class="cart-price">₹${price.toLocaleString('en-IN')}</td>
        <td data-label="Quantity">
          <div class="qty-box">
            <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
              <i class="fas fa-minus" style="font-size:0.7rem;"></i>
            </button>
            <span style="font-weight:700; min-width:20px;">${item.quantity}</span>
            <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
              <i class="fas fa-plus" style="font-size:0.7rem;"></i>
            </button>
          </div>
        </td>
        <td data-label="Subtotal" class="subtotal">₹${subtotal.toLocaleString('en-IN')}</td>
        <td data-label="Remove">
          <button onclick="removeItem(${item.id})" class="btn-remove">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;

      tbody.appendChild(row);
    });

    if (totalPriceEl) {
      totalPriceEl.innerText = `₹${total.toLocaleString('en-IN')}`;
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