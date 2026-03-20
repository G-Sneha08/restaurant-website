// =======================
// Backend API URL
// =======================
// API_BASE_URL is defined in config.js


document.addEventListener("DOMContentLoaded", () => {

    loadBookings();

    const form = document.getElementById("booking-form");

    if (!form) return;

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "login.html";
            return;
        }

        const name = document.getElementById("name")?.value;
        const email = document.getElementById("email")?.value;
        const phone = document.getElementById("phone")?.value;
        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;
        const guests = document.getElementById("guests").value;

        const submitBtn = form.querySelector("button[type='submit']");
        const originalBtnText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = "Booking...";

        try {
            // Explicitly use window.API_BASE_URL for global scope reliability
            const response = await fetch(`${window.API_BASE_URL}/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name, email, phone, date, time, guests })
            });

            const data = await response.json();

            // Redirect to login if token is expired or invalid
            if (response.status === 401) {
                alert("Session expired. Please login again.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "login.html";
                return;
            }

            if (response.ok && data.success) {

                alert(data.message || "Table reserved successfully!");
                form.reset();
                loadBookings();

            } else {

                alert(data.message || "Booking failed. Please try again.");

            }

        } catch (error) {

            console.error("Booking error:", error);
            alert("An error occurred. Please try again later.");

        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalBtnText;
        }

    });

});


// =======================
// Load Bookings
// =======================
async function loadBookings() {

    const token = localStorage.getItem("token");
    const list = document.getElementById("booking-list");

    if (!list) return;

    if (!token) {

        list.innerHTML = "<p class='text-center'>Please login to see bookings.</p>";
        return;

    }

    try {

        const response = await fetch(`${window.API_BASE_URL}/bookings`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        const bookings = data.bookings || [];

        if (!data.success || bookings.length === 0) {
            list.innerHTML = "<p class='text-center'>No reservations found.</p>";
            return;
        }

        list.innerHTML = bookings.map(b => `
            <div class="card" style="margin-bottom: 15px; padding: 15px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <p style="font-weight:600; margin-bottom:5px;">
                            ${new Date(b.date).toLocaleDateString('en-GB')} at ${b.time}
                        </p>
                        <p style="font-size:0.85rem; color:var(--text-light);">
                            ${b.guests} Guests | Status: <span style="color:${getStatusColor(b.status)}">${b.status}</span>
                        </p>
                    </div>
                    ${b.status === 'Pending' ? `
                    <button 
                        onclick="cancelBooking(${b.id})"
                        style="background:#e74c3c; color:white; border:none; padding:6px 12px; border-radius:5px; cursor:pointer;">
                        Cancel
                    </button>` : ''}
                </div>
            </div>
        `).join("");

    } catch (error) {

        console.error("Load bookings error:", error);

        list.innerHTML = "<p class='text-center'>Error loading bookings.</p>";

    }

}


// =======================
// Cancel Booking
// =======================
window.cancelBooking = async function (id) {

    const token = localStorage.getItem("token");

    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {

        const response = await fetch(`${window.API_BASE_URL}/bookings/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {

            alert("Booking cancelled successfully");
            loadBookings();

        } else {

            alert("Failed to cancel booking");

        }

    } catch (error) {

        console.error("Cancel error:", error);

    }

};

function getStatusColor(status) {
    switch (status) {
        case 'Confirmed': return '#2ecc71';
        case 'Cancelled': return '#e74c3c';
        case 'Completed': return '#3498db';
        default: return '#f1c40f';
    }
}