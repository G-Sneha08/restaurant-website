async function updateCartCount(){

  const res = await fetch(API_BASE_URL + "/cart/1");

  const data = await res.json();

  document.getElementById("cart-count").innerText =
    data.cart.length;

}

updateCartCount();