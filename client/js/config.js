// client/js/config.js

// Detect if running locally or deployed
const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

// Backend API URL
const API_BASE_URL = isLocal
    ? "http://localhost:5000/api"
    : "https://restaurant-backend-cli2.onrender.com/api";

console.log("[CONFIG] API_BASE_URL:", API_BASE_URL);


// Global API helper
async function apiRequest(endpoint, options = {}) {

    const res = await fetch(API_BASE_URL + endpoint, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
    }

    return res.json();
}

// expose globally
window.API_BASE_URL = API_BASE_URL;
window.apiRequest = apiRequest;