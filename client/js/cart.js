async function addToCart(menu_item_id, quantity = 1) {
  try {

    const res = await fetch(`${window.API_BASE_URL}/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: window.USER_ID,
        menu_item_id,
        quantity
      })
    });

    const data = await res.json();

    if (data.success) {
      alert(data.message || "Item added to cart");

      if (typeof updateNavbar === "function") {
        updateNavbar();
      }

    } else {
      alert(data.message || "Failed to add item");
    }

  } catch (err) {
    console.error("Add to cart error:", err);
    alert("Error adding item to cart");
  }
}

document.addEventListener("DOMContentLoaded", () => {

  const buttons = document.querySelectorAll(".add-to-cart");

  buttons.forEach(btn => {

    btn.addEventListener("click", () => {

      const menu_item_id = parseInt(btn.dataset.id);

      addToCart(menu_item_id);

    });

  });

});

// LOAD CART
async function loadCart() {

    try {

        const res = await fetch(`${API_BASE_URL}/cart/1`);

        const data = await res.json();

        const table = document.getElementById("cart-items");

        if (!data.success) return;

        table.innerHTML = data.cart.map(item => `

        <tr>

            <td>${item.name}</td>
            <td>₹${item.price}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price * item.quantity}</td>

        </tr>

        `).join("");

    } catch (err) {

        console.error("Load cart error:", err);

    }

}


// REMOVE ITEM
async function removeItem(id){

  await fetch(API_BASE_URL + "/cart/" + id,{
    method:"DELETE"
  });

  loadCart();
  updateNavbar();

}