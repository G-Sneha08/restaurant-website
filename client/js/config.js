// client/js/config.js

// Determine environment
const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1';

const API_BASE_URL = (() => {
    // Local development
    if (isLocal) return `${window.location.protocol}//${window.location.hostname}:5000/api`;

    // Production backend (replace with your deployed backend URL)
    return "https://restaurant-backend-cli2.onrender.com/api";
})();

console.log(`[CONFIG] Running in ${isLocal ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
console.log(`[CONFIG] API_BASE_URL: ${API_BASE_URL}`);

// Global helper function for API requests
window.apiRequest = async function(endpoint, options = {}) {
    try {
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

        // Handle non-JSON responses gracefully
        let data;
        try {
            data = await response.json();
        } catch (err) {
            throw new Error(`Invalid JSON response: ${await response.text()}`);
        }

        if (!response.ok) {
            throw new Error(data.message || `API error (${response.status})`);
        }

        return data;
    } catch (err) {
        console.error(`[API REQUEST ERROR] ${endpoint}`, err);
        throw err;
    }
};