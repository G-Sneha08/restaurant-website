document.addEventListener("DOMContentLoaded", () => {
    loadBookings();

    const form = document.getElementById("booking-form");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "login.html";
            return;
        }

        const date = document.getElementById("date").value;
        const time = document.getElementById("time").value;
        const guests = document.getElementById("guests").value;

        try {
            const response = await fetch("/api/booking", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ date, time, guests })
            });

            if (response.ok) {
                alert("Table reserved successfully!");
                form.reset();
                loadBookings();
            } else {
                alert("Booking failed. Please try again.");
            }

        } catch (error) {
            console.error("Booking error:", error);
        }
    });
});


async function loadBookings() {
    const token = localStorage.getItem("token");
    const list = document.getElementById("booking-list");

    if (!token) {
        list.innerHTML = "<p class='text-center'>Please login to see bookings.</p>";
        return;
    }

    try {
        const response = await fetch("/api/booking", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const bookings = await response.json();

        if (!bookings || bookings.length === 0) {
            list.innerHTML = "<p class='text-center'>No reservations found.</p>";
            return;
        }

        list.innerHTML = bookings.map(b => `
            <div class="card" style="margin-bottom: 15px; padding: 15px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <p style="font-weight:600;">
                            ${new Date(b.date).toLocaleDateString('en-GB')}
                        </p>
                        <p style="font-size:0.85rem; color:var(--text-light);">
                            ${b.time} | ${b.guests} Guests
                        </p>
                    </div>

                    <button 
                        onclick="cancelBooking(${b.id})" 
                        style="background:#e74c3c; color:white; border:none; padding:6px 12px; border-radius:5px; cursor:pointer;">
                        Cancel
                    </button>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Load bookings error:", error);
        list.innerHTML = "<p class='text-center'>Error loading bookings.</p>";
    }
}


// ✅ KEEP THIS OUTSIDE
window.cancelBooking = async function(id) {
    const token = localStorage.getItem("token");

    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
        const response = await fetch(`/api/booking/${id}`, {
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