document.title = document.title.replace(/_+SITE_+/, SITE.name);
(function () {
  const p2ShopContainer = document.getElementById("shopProfileContainer");

  function p2GetEmoji(category) {
    if (typeof CATEGORY_EMOJI !== "undefined" && CATEGORY_EMOJI && CATEGORY_EMOJI[category]) {
      return CATEGORY_EMOJI[category];
    }
    return "✨";
  }

  function p2RenderShopMissing() {
    if (!p2ShopContainer) return;
    p2ShopContainer.innerHTML = `
      <div class="not-found-box">
        <h2>Shop not found</h2>
        <p>We couldn't find that maker shop.</p>
        <a href="products.html" class="btn-primary">Browse All Products</a>
      </div>
    `;
  }

  function p2InitShopPage() {
    if (!p2ShopContainer) return;

    const id = new URLSearchParams(window.location.search).get("id");
    const shop = id && typeof getShop === "function" ? getShop(id) : null;

    if (!shop) {
      p2RenderShopMissing();
      return;
    }

    document.title = `${shop.name} | ${SITE.name}`;

    const allProducts = typeof getProducts === "function" ? getProducts() : [];
    const shopItems = allProducts.filter((p) => p.shopId === shop.id);
    const deliveryEntries = shop.deliveryCities && typeof shop.deliveryCities === "object"
      ? Object.entries(shop.deliveryCities)
      : [];

    const deliveryListMarkup = deliveryEntries.length > 0
      ? `<ul class="delivery-chips">
          ${deliveryEntries.map(([city, charge]) => {
            const formattedCharge = typeof formatPKR === "function" ? formatPKR(charge) : `Rs ${charge}`;
            return `<li class="delivery-chip">🚚 ${city}: ${formattedCharge}</li>`;
          }).join("")}
        </ul>`
      : `<p class="shop-about-text">No city delivery rates listed yet.</p>`;

    p2ShopContainer.innerHTML = `
      <section class="shop-hero-card">
        <div id="p2ShopBanner" class="shop-banner-box">
          ${shop.banner ? `<img src="../${shop.banner}" alt="${shop.name} banner">` : `<span>🛍️ ${shop.name}</span>`}
        </div>

        <div class="shop-profile-body">
          <div class="shop-identity">
            ${shop.logo ? `<img src="../${shop.logo}" alt="${shop.name} logo" class="shop-avatar">` : ""}
            <div>
              <h1>${shop.name}</h1>
              <span class="shop-city-pill">📍 Based in ${shop.city || "Pakistan"}</span>
            </div>
          </div>

          <p class="shop-about-text">${shop.about || ""}</p>

          <div class="delivery-section">
            <h2>Delivery Cities & Charges</h2>
            ${deliveryListMarkup}
          </div>
        </div>
      </section>

      <section>
        <div class="shop-catalog-head">
          <h2>Shop Collection (${shopItems.length})</h2>
        </div>
        <div id="p2ShopGrid" class="shop-products-grid"></div>
      </section>
    `;

    const bannerBox = document.getElementById("p2ShopBanner");
    if (bannerBox) {
      const bannerImg = bannerBox.querySelector("img");
      if (bannerImg) {
        bannerImg.addEventListener("error", () => {
          bannerBox.innerHTML = `<span>🛍️ ${shop.name}</span>`;
        });
      }
    }

    const avatarImg = p2ShopContainer.querySelector(".shop-avatar");
    if (avatarImg) {
      avatarImg.addEventListener("error", () => {
        avatarImg.remove();
      });
    }

    const grid = document.getElementById("p2ShopGrid");
    if (!grid) return;

    if (!shopItems.length) {
      grid.innerHTML = `<div class="not-found-box">This shop hasn't listed any products yet.</div>`;
      return;
    }

    shopItems.forEach((prod) => {
      const card = document.createElement("article");
      card.className = "product-card";
      const emoji = p2GetEmoji(prod.category);
      const imgPath = Array.isArray(prod.images) && prod.images[0] ? `../${prod.images[0]}` : "";
      const priceStr = typeof formatPKR === "function" ? formatPKR(prod.price) : `Rs ${prod.price}`;

      card.innerHTML = `
        <a href="product.html?id=${encodeURIComponent(prod.id)}" class="shop-prod-link">
          <div class="shop-prod-img">
            ${imgPath ? `<img src="${imgPath}" alt="${prod.title}">` : `<span>${emoji}</span>`}
          </div>
          <h3 class="shop-prod-title">${prod.title}</h3>
          <div class="shop-prod-price">${priceStr}</div>
          <span class="badge-stock">${Number(prod.stock) > 0 ? `${prod.stock} in stock` : "Out of stock"}</span>
        </a>
        <a href="product.html?id=${encodeURIComponent(prod.id)}" class="btn-primary">View Item</a>
      `;

      const imgEl = card.querySelector(".shop-prod-img img");
      if (imgEl) {
        imgEl.addEventListener("error", () => {
          imgEl.replaceWith(Object.assign(document.createElement("span"), { textContent: emoji }));
        });
      }

      grid.appendChild(card);
    });
  }

  p2InitShopPage();
})();