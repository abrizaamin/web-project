/* common.js - navbar, footer, splash, helpers (Member 1) */

// Naam, tagline aur logo sirf yahan badlein. Poori site mein khud update hoga.
const SITE = {
  name: "Whimsy Potli",
  tagline: "handmade with love",
  country: "Pakistan",
  logo: "images/logo.png"
};

// index.html root mein hai, baqi pages html/ folder mein
const IN_HTML = window.location.pathname.includes("/html/");
const PAGES = IN_HTML ? "" : "html/";
const ROOT  = IN_HTML ? "../" : "";
const LOGO_SRC = ROOT + SITE.logo;

/* ---------- Splash screen (website khulte hi logo animation) ---------- */
function showSplash() {
  if (sessionStorage.getItem("splashShown")) return;   // har browser session mein sirf ek baar
  sessionStorage.setItem("splashShown", "1");

  const s = document.createElement("div");
  s.id = "splash";
  s.innerHTML = `
    <div class="splash-inner">
      <img class="splash-logo" src="${LOGO_SRC}" alt="" onerror="this.style.display='none'">
      <h1 class="splash-name">${SITE.name}</h1>
      <p class="splash-tag">${SITE.tagline}</p>
    </div>`;
  document.body.appendChild(s);
  document.body.classList.add("no-scroll");

  const close = () => {
    s.classList.add("hide");
    document.body.classList.remove("no-scroll");
    setTimeout(() => s.remove(), 700);
  };
  setTimeout(close, 2800);
  s.addEventListener("click", close);   // click karke skip bhi kar sakte hain
}

/* ---------- Browser tab ka chhota icon ---------- */
function setFavicon() {
  const link = document.createElement("link");
  link.rel = "icon";
  link.href = LOGO_SRC;
  document.head.appendChild(link);
}

/* ---------- Navbar ---------- */
function renderNavbar() {
  const el = document.getElementById("navbar");
  if (!el) return;
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCount = cart.reduce((s, i) => s + (i.qty || 0), 0);
  const home = user && user.role === "seller" ? "dashboard.html" : "profile.html";

  el.innerHTML = `
    <nav class="navbar">
      <a href="${ROOT}index.html" class="logo">
        <img class="logo-img" src="${LOGO_SRC}" alt="" onerror="this.style.display='none'">
        <span class="logo-text">${SITE.name}<small>${SITE.tagline}</small></span>
      </a>
      <button class="nav-toggle" aria-label="Menu" aria-expanded="false">&#9776;</button>
      <div class="nav-links" id="navLinks">
        <a href="${PAGES}products.html">Shop</a>
        <a href="${PAGES}gift-planner.html" class="nav-ai">Gift Planner</a>
        <a href="${PAGES}cart.html" class="nav-cart">Cart (${cartCount})</a>
        ${user
          ? `<a href="${PAGES}${home}">${user.name.split(" ")[0]}</a><a href="#" id="logoutLink">Logout</a>`
          : `<a href="${PAGES}login.html">Login</a><a href="${PAGES}signup.html">Sign up</a>`}
      </div>
    </nav>`;

  const toggle = el.querySelector(".nav-toggle");
  toggle.addEventListener("click", () => {
    const open = document.getElementById("navLinks").classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  const out = document.getElementById("logoutLink");
  if (out) out.addEventListener("click", (e) => { e.preventDefault(); logout(); });
}

/* ---------- Footer ---------- */
function renderFooter() {
  const el = document.getElementById("footer");
  if (!el) return;
  el.innerHTML = `
    <footer class="footer">
      <div class="footer-grid">
        <div>
          <h4>${SITE.name}</h4>
          <p class="hand">${SITE.tagline}, from small shops across ${SITE.country}.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <a href="${PAGES}products.html">All products</a>
          <a href="${PAGES}gift-planner.html">Gift Planner</a>
          <a href="${PAGES}orders.html">My orders</a>
        </div>
        <div>
          <h4>Sell with us</h4>
          <a href="${PAGES}signup.html">Open your shop</a>
          <a href="${PAGES}login.html">Seller login</a>
        </div>
      </div>
      <p class="footer-bottom">&copy; ${new Date().getFullYear()} ${SITE.name}. Made by students, for makers.</p>
    </footer>`;
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = ROOT + "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  showSplash();
  setFavicon();
  document.title = document.title.replace("__SITE__", SITE.name);
  renderNavbar();
  renderFooter();
});