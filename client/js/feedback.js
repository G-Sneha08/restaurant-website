// =======================
// Feedback submission and display
// =======================

async function submitFeedback(event) {
    if (event) event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        showToast("Please login to submit feedback!", 'warning');
        setTimeout(() => window.location.href = "login.html", 1500);
        return;
    }

    const message = document.getElementById('message').value;
    const rating = document.getElementById('rating').value;

    if (!message || !rating) {
        showToast("Please fill in all fields", 'warning');
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ message, rating })
        });

        const data = await res.json();
        if (res.ok) {
            showToast("✅ Feedback submitted successfully!");
            document.getElementById('feedback-form').reset();
            loadFeedback(); // Refresh feedback list
        } else {
            showToast(data.message || "⚠️ Something went wrong. Try again!", 'error');
        }
    } catch (err) {
        console.error(err);
        showToast("⚠️ Something went wrong. Try again!", 'error');
    }
}

async function loadFeedback() {
    const feedbackGrid = document.getElementById('feedback-list');
    if (!feedbackGrid) return;

    try {
        const res = await fetch(`${API_BASE_URL}/feedback`);
        const data = await res.json();
        
        // Handle both array (legacy) and successful object response
        const feedbackItems = Array.isArray(data) ? data : (data?.feedback || []);

        if (feedbackItems.length === 0) {
            feedbackGrid.innerHTML = '<p class="text-center">No feedback yet. Be the first to share your experience!</p>';
            return;
        }

        feedbackGrid.innerHTML = feedbackItems.map(item => `
            <div class="card" style="margin-bottom: 20px; padding: 20px;">
                <div style="color: gold; margin-bottom: 10px;">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</div>
                <p style="font-style: italic; color: var(--text-dark);">"${item.message}"</p>
                <p style="margin-top: 15px; font-size: 0.85rem; font-weight: 600;">- ${item.name}</p>
            </div>
        `).join('');
    } catch (err) {
        console.error("Failed to load feedback", err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadFeedback();
    const feedbackForm = document.getElementById('feedback-form');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', submitFeedback);
    }
});
