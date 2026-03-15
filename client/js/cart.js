const USER_ID = 1;


// ADD TO CART
async function addToCart(menuId){

  try{

    await fetch(API_BASE_URL + "/cart",{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        user_id:USER_ID,
        menu_item_id:menuId,
        quantity:1
      })

    });

    loadCart();
    updateNavbar();

  }catch(err){
    console.error(err);
  }

}


// LOAD CART
async function loadCart(){

  try{

    const res = await fetch(API_BASE_URL + "/cart/" + USER_ID);

    const data = await res.json();

    const table = document.getElementById("cart-items");

    if(!table) return;

    table.innerHTML = data.cart.map(item=>`

      <tr>

        <td>${item.name}</td>

        <td>₹${item.price}</td>

        <td>${item.quantity}</td>

        <td>₹${item.price * item.quantity}</td>

        <td>
          <button onclick="removeItem(${item.id})">
            Remove
          </button>
        </td>

      </tr>

    `).join("");

  }catch(err){
    console.error(err);
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