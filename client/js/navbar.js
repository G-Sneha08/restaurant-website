async function updateNavbar(){

  try{

    const res = await fetch(API_BASE_URL + "/cart/1");

    const data = await res.json();

    const el = document.getElementById("cart-count");

    if(el){
      el.innerText = data.cart.length;
    }

  }catch(err){
    console.error(err);
  }

}

updateNavbar();