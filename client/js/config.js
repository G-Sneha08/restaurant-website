const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal 
    ? `${window.location.protocol}//${window.location.host}/api`
    : "https://restaurant-backend-cli2.onrender.com/api";