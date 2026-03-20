const isLocal = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' || 
                 window.location.hostname.endsWith('.github.dev');

// Determine API URL based on environment
let API_BASE_URL;

if (window.location.hostname.endsWith('.github.dev')) {
    // GitHub Codespaces dynamic port mapping
    API_BASE_URL = `${window.location.protocol}//${window.location.hostname.replace('-3000.', '-5000.')}/api`;
} else if (isLocal) {
    // Standard local dev usually has backend on 5000
    API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:5000/api`;
} else {
    // Production Render URL
    API_BASE_URL = "https://restaurant-backend-cli2.onrender.com/api";
}

console.log(`[CONFIG] Environment: ${isLocal ? 'DEVELOPMENT' : 'PRODUCTION'}`);
console.log(`[CONFIG] Source: ${window.location.hostname}`);
console.log(`[CONFIG] API_BASE_URL: ${API_BASE_URL}`);

window.API_BASE_URL = API_BASE_URL;

window.apiRequest = async function(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "API error");
    }
    return data;
};
