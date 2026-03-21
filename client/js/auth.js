// ================= AUTH SCRIPT =================

document.addEventListener("DOMContentLoaded", () => {

    // Backend API
    // API_BASE_URL is defined in config.js


    // ================= LOGIN =================
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const email = document.querySelector("input[name='email']").value;
            const password = document.querySelector("input[name='password']").value;

            try {

                const response = await fetch(`${window.API_BASE_URL}/auth/login`, {
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

                    if (data.user) {
                        localStorage.setItem("user", JSON.stringify(data.user));
                        if (data.user.role === 'admin') {
                            localStorage.setItem("adminToken", data.token);
                            localStorage.setItem("adminLoggedIn", "true");
                        }
                    }

                    alert("Login Successful!");
                    
                    if (data.user && data.user.role === 'admin') {
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "index.html";
                    }

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
        const submitBtn = registerForm.querySelector("button[type='submit']");

        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nameEl = document.getElementById("name");
            const emailEl = document.getElementById("email");
            const passwordEl = document.getElementById("password");

            const name = nameEl ? nameEl.value.trim() : "";
            const email = emailEl ? emailEl.value.trim() : "";
            const password = passwordEl ? passwordEl.value : "";

            if (!name || !email || !password) {
                alert("All fields are required.");
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Creating Account...";
            }

            try {
                const response = await fetch(`${window.API_BASE_URL}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message || "Welcome to Lumina Dine! Your account has been successfully created. Please login to continue.");
                    window.location.href = "login.html";
                } else {
                    alert(data.message || "Registration failed");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Register";
                    }
                }
            } catch (error) {
                console.error("Register Error:", error);
                alert("Server error during registration");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = "Register";
                }
            }
        });
    }

});