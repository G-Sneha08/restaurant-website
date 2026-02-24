console.log("Auth JS Loaded");

document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.querySelector("input[name='email']").value;
            const password = document.querySelector("input[name='password']").value;

            try {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Login Successful!");

                    // SAVE TOKEN
                    localStorage.setItem("token", data.token);

                    // Redirect to home
                    window.location.href = "/";
                } else {
                    alert(data.message || "Login failed");
                }

            } catch (error) {
                console.error("Login Error:", error);
                alert("Server error during login");
            }
        });
    }
});