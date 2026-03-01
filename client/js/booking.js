document.addEventListener("DOMContentLoaded", () => {
    loadBookings();

    const form = document.getElementById("booking-form");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const token = localStorage.getItem("token");

            if (!token) {
                alert("Please login first");
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

                const data = await response.json();

                if (response.ok) {
                    alert("Table reserved successfully!");
                    form.reset();
                    loadBookings(); // reload after booking
                } else {
                    alert(data.message);
                }

            } catch (error) {
                console.error(error);
                alert("Error booking table");
            }
        });
    }
});


// ================= LOAD BOOKINGS =================
async function loadBookings() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("booking-list");

    if (!container) return;

    if (!token) {
        container.innerHTML = "<p>Please login to view bookings.</p>";
        return;
    }

    try {
        const response = await fetch("/api/booking", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const bookings = await response.json();

        if (bookings.length === 0) {
            container.innerHTML = "<p>No bookings yet.</p>";
            return;
        }

        container.innerHTML = "";

        bookings.forEach(booking => {
            container.innerHTML += `
                <div class="booking-card">
                    <h3>Reservation</h3>
                    <p><strong>Date:</strong> ${booking.date.split("T")[0]}</p>
                    <p><strong>Time:</strong> ${booking.time}</p>
                    <p><strong>Guests:</strong> ${booking.guests}</p>
                </div>
            `;
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = "<p>Error loading bookings.</p>";
    }
}