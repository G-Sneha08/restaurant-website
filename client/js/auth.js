document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();   // 🔥 prevents page reload

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
                    localStorage.setItem("token", data.token);
                    alert("Login Successful!");
                    window.location.href = "/";
                } else {
                    alert(data.message || "Login failed");
                }

            } catch (error) {
                console.error(error);
                alert("Server error during login");
            }
        });
    }
});