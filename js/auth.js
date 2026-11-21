/* auth.js - signup & login (Member 1) */
function getUsers() { return JSON.parse(localStorage.getItem("users")) || USERS; }
function saveUsers(users) { localStorage.setItem("users", JSON.stringify(users)); }

const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;
    const role = document.querySelector('input[name="role"]:checked').value;
    const err = document.getElementById("error");

    if (!name || !email) { err.textContent = "Please fill in your name and email."; return; }
    if (password.length < 6) { err.textContent = "Password must be at least 6 characters."; return; }
    if (password !== confirm) { err.textContent = "Passwords do not match."; return; }
    const users = getUsers();
    if (users.find(u => u.email === email)) { err.textContent = "This email is already registered. Try logging in."; return; }

    const newUser = { id: "u" + Date.now(), name, email, password, role, addresses: [] };
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    window.location.href = role === "seller" ? "dashboard.html" : ROOT + "index.html";
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const user = getUsers().find(u => u.email === email && u.password === password);
    if (!user) { document.getElementById("error").textContent = "Wrong email or password."; return; }
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.location.href = user.role === "seller" ? "dashboard.html" : ROOT + "index.html";
  });
}