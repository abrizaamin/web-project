/* profile.js - profile page & saved addresses (Member 1) */
// Address shape (Member 3 ko batana): { label, street, city, phone }
const me = JSON.parse(localStorage.getItem("currentUser"));
if (!me) { window.location.href = "login.html"; }

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function persistUser() {
  localStorage.setItem("currentUser", JSON.stringify(me));
  saveUsers(getUsers().map(u => u.id === me.id ? me : u));
}

function renderProfile() {
  document.getElementById("pName").textContent = me.name;
  document.getElementById("pEmail").textContent = me.email;
  document.getElementById("pRole").textContent = me.role === "seller" ? "Seller" : "Buyer";
  document.getElementById("pInitial").textContent = me.name.charAt(0).toUpperCase();
  document.getElementById("editName").value = me.name;

  const list = document.getElementById("addressList");
  const addrs = me.addresses || [];
  list.innerHTML = addrs.length ? addrs.map((a, i) => `
    <div class="addr-card">
      <strong>${esc(a.label)}</strong>
      <p>${esc(a.street)}<br>${esc(a.city)} &bull; ${esc(a.phone)}</p>
      <button type="button" class="link-btn" data-del="${i}">Remove</button>
    </div>`).join("") : `<p class="muted">No saved addresses yet. Add one below so checkout is quicker.</p>`;
}

document.getElementById("nameForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const v = document.getElementById("editName").value.trim();
  if (!v) return;
  me.name = v; persistUser(); renderProfile(); renderNavbar();
});

document.getElementById("addrForm").addEventListener("submit", (e) => {
  e.preventDefault();
  me.addresses = me.addresses || [];
  me.addresses.push({
    label: document.getElementById("aLabel").value.trim(),
    street: document.getElementById("aStreet").value.trim(),
    city: document.getElementById("aCity").value,
    phone: document.getElementById("aPhone").value.trim()
  });
  persistUser(); e.target.reset(); renderProfile();
});

document.getElementById("addressList").addEventListener("click", (e) => {
  const i = e.target.dataset.del;
  if (i === undefined) return;
  me.addresses.splice(Number(i), 1); persistUser(); renderProfile();
});

document.getElementById("aCity").innerHTML = CITIES.map(c => `<option>${c}</option>`).join("");
if (me) renderProfile();