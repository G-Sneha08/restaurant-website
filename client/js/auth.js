// ================= AUTH SCRIPT =================

document.addEventListener("DOMContentLoaded", () => {

    // ================= LOGIN =================
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
                    // Save token
                    localStorage.setItem("token", data.token);

                    // Save user if returned
                    if (data.user) {
                        localStorage.setItem("user", JSON.stringify(data.user));
                    }

                    alert("Login Successful!");
                    window.location.href = "index.html";
                } else {
                    alert(data.message || "Login failed");
                }

            } catch (error) {
                console.error("Login Error:", error);
                alert("Server error during login");
            }
        });
    }


    // ================= REGISTER =================
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = document.querySelector("input[name='name']").value;
            const email = document.querySelector("input[name='email']").value;
            const password = document.querySelector("input[name='password']").value;

            try {
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Registration Successful! Please login.");
                    window.location.href = "login.html";
                } else {
                    alert(data.message || "Registration failed");
                }

            } catch (error) {
                console.error("Register Error:", error);
                alert("Server error during registration");
            }
        });
    }

});