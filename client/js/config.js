const isLocal = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1' || 
                 window.location.hostname.endsWith('.github.dev');

const API_BASE_URL = window.location.hostname.endsWith('.github.dev')
    ? `${window.location.protocol}//${window.location.hostname.replace('-3000.', '-5000.')}/api`
    : (isLocal ? `${window.location.protocol}//${window.location.host}/api` : "https://restaurant-backend-cli2.onrender.com/api");

console.log(`[CONFIG] Running in ${isLocal ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
console.log(`[CONFIG] API_BASE_URL: ${API_BASE_URL}`);

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
