// ================= ADD TO CART =================
async function addToCart(id) {

  try {

    const res = await fetch(`${window.API_BASE_URL}/cart`, {
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

  try {

    const tbody = document.getElementById("cart-items");
    const table = document.getElementById("cart-table");
    const emptyMsg = document.getElementById("empty-msg");
    const totalPriceEl = document.getElementById("total-price");
    const footerActions = document.getElementById("cart-footer-actions");

    if (!tbody || !table) return;

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
function checkoutCart() {

  alert("Checkout feature coming soon!");

}



// ================= PAGE LOAD =================
document.addEventListener("DOMContentLoaded", () => {

  loadCart();

});