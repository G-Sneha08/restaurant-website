// client/js/config.js

// Determine if we are running in a local environment
const isLocalhost = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';

// Set the global API Base URL
window.API_BASE_URL = isLocalhost
    ? "http://localhost:5000/api"
    : "https://restaurant-backend-cli2.onrender.com/api";

console.log(`[CONFIG] Environment: ${isLocalhost ? 'LOCAL' : 'PRODUCTION'}`);
console.log(`[CONFIG] API_BASE_URL: ${window.API_BASE_URL}`);

// Helper function for API requests (keeps code clean and handles tokens)
window.apiRequest = async function(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(token && token !== 'null' && token !== 'undefined' && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {})
    };

    const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    let data = {};
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        const text = await response.text();
        data = { message: text || `Error ${response.status}` };
    }

    if (!response.ok) {
        const err = new Error(data.message || `API error ${response.status}`);
        err.status = response.status;
        throw err;
    }
    return data;
};
