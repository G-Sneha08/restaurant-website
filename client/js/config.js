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

window.API_BASE_URL = API_BASE_URL;

if (isLocal) {
    console.log(`[CONFIG] Environment: ${isLocal ? 'DEVELOPMENT' : 'PRODUCTION'}`);
    console.log(`[CONFIG] Source: ${window.location.hostname}`);
    console.log(`[CONFIG] API_BASE_URL: ${API_BASE_URL}`);
}

window.apiRequest = async function(endpoint, options = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...(token && token !== 'null' && token !== 'undefined' && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {})
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
