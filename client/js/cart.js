async function addToCart(id) {

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
}

// LOAD CART
async function loadCart() {

  try {

    const res = await fetch(`${window.API_BASE_URL}/cart/${window.USER_ID}`);
    const data = await res.json();

    const cartContainer = document.getElementById("cart-items");
    cartContainer.innerHTML = "";

    if (!data.success || data.cart.length === 0) {
      cartContainer.innerHTML = "<p>Your cart is empty</p>";
      return;
    }

    data.cart.forEach(item => {

      const cartItem = document.createElement("div");

      cartItem.className = "cart-item";

      cartItem.innerHTML = `
        <h3>${item.item_name}</h3>
        <p>Price: ₹${item.price}</p>
        <p>Quantity: ${item.quantity}</p>
        <p>Total: ₹${item.price * item.quantity}</p>
      `;

      cartContainer.appendChild(cartItem);

    });

    document.getElementById("total-price").innerText =
      "Total: ₹" + data.totalPrice;

  } catch (err) {

    console.error("Cart load error:", err);

  }

}

loadCart();

// REMOVE ITEM
async function removeItem(id){

  await fetch(API_BASE_URL + "/cart/" + id,{
    method:"DELETE"
  });

  loadCart();
  updateNavbar();

}