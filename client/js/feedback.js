// =======================
// Feedback submission and display
// =======================

async function submitFeedback(event) {
    if (event) event.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        alert("Please login to submit feedback!");
        window.location.href = "login.html";
        return;
    }

    const message = document.getElementById('message').value;
    const rating = document.getElementById('rating').value;

    if (!message || !rating) {
        alert("Please fill in all fields");
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
            alert("Thank you for your feedback!");
            document.getElementById('feedback-form').reset();
            loadFeedback(); // Refresh feedback list
        } else {
            alert(data.message || "Failed to submit feedback");
        }
    } catch (err) {
        console.error(err);
        alert("Server error");
    }
}

async function loadFeedback() {
    const feedbackGrid = document.getElementById('feedback-list');
    if (!feedbackGrid) return;

    try {
        const res = await fetch(`${API_BASE_URL}/feedback`);
        const data = await res.json();

        if (data.length === 0) {
            feedbackGrid.innerHTML = '<p class="text-center">No feedback yet. Be the first to share your experience!</p>';
            return;
        }

        feedbackGrid.innerHTML = data.map(item => `
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
