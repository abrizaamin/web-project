/* planner.js - AI Gift Planner, Phase 1 (fake logic). Real AI Phase 3 mein aayegi. */

// Occasion / recipient se keywords: matching ko "smart" banata hai
const OCCASION_WORDS = { Birthday: ["birthday", "party", "cake"], Anniversary: ["anniversary", "romantic", "rose"], Eid: ["eid", "festive", "sweet"], Wedding: ["romantic", "decor", "flowers"], "Thank you": ["thank", "small", "sweet"] };
const RECIPIENT_WORDS = { Mother: ["mother", "cozy", "flowers"], Friend: ["friend", "cute"], Sister: ["sister", "cute", "pink"], "Husband / Wife": ["romantic", "anniversary"], Colleague: ["colleague", "small", "stationery"] };

function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function allowedProducts(city) {
  return PRODUCTS.filter(p => {
    if (p.stock <= 0) return false;
    if (p.isBakingItem && city !== "Lahore") return false;           // baking sirf Lahore
    const shop = getShop(p.shopId);
    return shop && shop.deliveryCities[city] !== undefined;           // shop us city mein deliver kare
  });
}

function keywordsFor(plan) {
  const typed = plan.prefs.toLowerCase().split(/[^a-z]+/).filter(w => w.length > 2);
  return [...typed, ...(OCCASION_WORDS[plan.occasion] || []), ...(RECIPIENT_WORDS[plan.recipient] || [])];
}

function score(p, words) {
  const text = (p.title + " " + p.description + " " + p.category).toLowerCase();
  let s = 0;
  words.forEach(w => { if (p.tags.includes(w)) s += 3; else if (text.includes(w)) s += 1.5; });
  return s + Math.random() * 0.8; // thora random, taake har baar thora alag aaye
}

function totalOf(items) { return items.reduce((s, i) => s + i.price, 0); }

function generateGiftPlan(input) {
  const plan = { ...input, items: [] };
  const words = keywordsFor(plan);
  const ranked = allowedProducts(plan.city).map(p => ({ p, s: score(p, words) })).sort((a, b) => b.s - a.s).map(x => x.p);

  const usedCats = new Set();
  let total = 0;
  for (const p of ranked) {                       // pehle har category se ek (variety)
    if (plan.items.length >= 4) break;
    if (!usedCats.has(p.category) && total + p.price <= plan.budget) { plan.items.push(p); usedCats.add(p.category); total += p.price; }
  }
  for (const p of ranked) {                       // phir bacha hua budget bharein
    if (plan.items.length >= 4) break;
    if (!plan.items.includes(p) && total + p.price <= plan.budget) { plan.items.push(p); total += p.price; }
  }
  return plan;
}

function swapItem(index) {
  const plan = JSON.parse(localStorage.getItem("giftPlan"));
  const old = plan.items[index];
  const room = plan.budget - (totalOf(plan.items) - old.price);
  const options = allowedProducts(plan.city).filter(p => !plan.items.some(i => i.id === p.id) && p.price <= room);
  if (!options.length) { showToast("No other item fits your budget for this spot."); return; }
  const words = keywordsFor(plan);
  options.sort((a, b) => score(b, words) - score(a, words));
  plan.items[index] = options[Math.floor(Math.random() * Math.min(3, options.length))];
  localStorage.setItem("giftPlan", JSON.stringify(plan));
  renderResults();
}

function addAllToCart() {
  const plan = JSON.parse(localStorage.getItem("giftPlan"));
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  plan.items.forEach(p => {
    const variation = {};
    if (p.variations.color.length) variation.color = p.variations.color[0];
    if (p.variations.size.length) variation.size = p.variations.size[0];
    const found = cart.find(c => c.productId === p.id && JSON.stringify(c.variation) === JSON.stringify(variation));
    if (found) found.qty += 1; else cart.push({ productId: p.id, qty: 1, variation, shopId: p.shopId });
  });
  localStorage.setItem("cart", JSON.stringify(cart));
  renderNavbar();
  showToast("Added to your cart. Delivery charges are added at checkout.");
}

function showToast(msg) { const t = document.getElementById("toast"); if (t) t.textContent = msg; }

function renderResults() {
  const plan = JSON.parse(localStorage.getItem("giftPlan"));
  const root = document.getElementById("results");
  if (!plan) { root.innerHTML = `<div class="empty-plan"><h2>No plan yet</h2><p>Tell us your budget and ideas first.</p><a class="btn-again" href="gift-planner.html">Plan a gift</a></div>`; return; }

  document.getElementById("planMeta").textContent =
    `${plan.occasion} gift for ${plan.recipient.toLowerCase()} in ${plan.city}, budget ${formatPKR(plan.budget)}`;

  if (!plan.items.length) {
    root.innerHTML = `<div class="empty-plan"><h2>Nothing fits that budget yet</h2>
      <p>Try a higher budget or a different city. Cakes are delivered in Lahore only.</p>
      <a class="btn-again" href="gift-planner.html">Change my answers</a></div>`;
    return;
  }

  const total = totalOf(plan.items);
  root.innerHTML = `
    <div class="gift-grid">${plan.items.map((p, i) => `
      <article class="gift-card">
        <div class="gift-img"><img src="../${esc(p.images[0])}" alt="${esc(p.title)}"
          onerror="this.replaceWith(document.createTextNode('${CATEGORY_EMOJI[p.category] || "🎁"}'))"></div>
        <h3>${esc(p.title)}</h3>
        <p class="gift-shop">by ${esc(getShop(p.shopId).name)}</p>
        <p class="gift-price">${formatPKR(p.price)}</p>
        <button type="button" class="btn-swap" data-swap="${i}">Swap item</button>
      </article>`).join("")}
    </div>
    <div class="summary-bar">
      <div class="nums">
        <div><span>Basket total</span><strong>${formatPKR(total)}</strong></div>
        <div><span>Budget left</span><strong>${formatPKR(plan.budget - total)}</strong></div>
      </div>
      <div class="actions">
        <a class="btn-again" href="gift-planner.html">Start over</a>
        <button type="button" class="btn-addall" id="addAll">Add all to cart</button>
      </div>
    </div>`;
  root.querySelectorAll("[data-swap]").forEach(b => b.addEventListener("click", () => swapItem(Number(b.dataset.swap))));
  document.getElementById("addAll").addEventListener("click", addAllToCart);
}

/* Form page */
const plannerForm = document.getElementById("plannerForm");
if (plannerForm) {
  document.getElementById("city").innerHTML = CITIES.map(c => `<option>${c}</option>`).join("");
  plannerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const budget = Number(document.getElementById("budget").value);
    const err = document.getElementById("plannerError");
    if (!budget || budget < 300) { err.textContent = "Please enter a budget of at least Rs 300."; return; }
    const plan = generateGiftPlan({
      budget, city: document.getElementById("city").value,
      occasion: document.getElementById("occasion").value,
      recipient: document.getElementById("recipient").value,
      prefs: document.getElementById("prefs").value.trim()
    });
    localStorage.setItem("giftPlan", JSON.stringify(plan));
    window.location.href = "gift-results.html";
  });
}

/* Results page */
if (document.getElementById("results")) renderResults();