async function loadBookings() {
    const token = localStorage.getItem("token");
    const container = document.getElementById("bookings-container");

    if (!token) {
        container.innerHTML = "<p>Please login to see your bookings.</p>";
        return;
    }

    try {
        const response = await fetch("/api/booking", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const bookings = await response.json();
        console.log(bookings);

        if (bookings.length === 0) {
            container.innerHTML = "<p>No bookings found.</p>";
            return;
        }

        container.innerHTML = "";

        bookings.forEach(booking => {
            container.innerHTML += `
                <div class="booking-card">
                    <h3>Reservation</h3>
                    <p><strong>Date:</strong> ${booking.date}</p>
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

document.addEventListener("DOMContentLoaded", loadBookings);