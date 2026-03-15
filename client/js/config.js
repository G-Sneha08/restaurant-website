const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://restaurant-backend-cli2.onrender.com/api";

window.API_BASE_URL = API_BASE_URL;
window.USER_ID = 1;