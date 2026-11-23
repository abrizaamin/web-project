document.title = document.title.replace(/_+SITE_+/, SITE.name);
(function () {
  const p2ChipsContainer = document.getElementById("homeCategoryChips");
  const p2ShopsContainer = document.getElementById("homeFeaturedShops");
  const p2ProductsContainer = document.getElementById("homeFeaturedProducts");

  function p2GetEmoji(category) {
    if (typeof CATEGORY_EMOJI !== "undefined" && CATEGORY_EMOJI[category]) {
      return CATEGORY_EMOJI[category];
    }
    return "✨";
  }

  function p2RenderCategoryChips() {
    if (!p2ChipsContainer || typeof CATEGORIES === "undefined" || !Array.isArray(CATEGORIES)) return;
    p2ChipsContainer.innerHTML = "";

    CATEGORIES.forEach((cat) => {
      const link = document.createElement("a");
      link.href = `html/products.html?category=${encodeURIComponent(cat)}`;
      link.className = "p2-category-chip";
      link.textContent = `${p2GetEmoji(cat)} ${cat}`;
      p2ChipsContainer.appendChild(link);
    });
  }

  function p2RenderFeaturedShops() {
    if (!p2ShopsContainer || typeof getShops !== "function") return;
    const shops = getShops().slice(0, 3);
    p2ShopsContainer.innerHTML = "";

    shops.forEach((shop) => {
      const card = document.createElement("article");
      card.className = "p2-shop-card";
      card.innerHTML = `
        <div>
          <h3>${shop.name}</h3>
          <span class="p2-shop-city">📍 ${shop.city || "Pakistan"}</span>
          <p>${shop.about || ""}</p>
        </div>
        <a href="html/shop.html?id=${encodeURIComponent(shop.id)}" class="btn-primary">Visit Shop</a>
      `;
      p2ShopsContainer.appendChild(card);
    });
  }

  function p2RenderFeaturedProducts() {
    if (!p2ProductsContainer || typeof getProducts !== "function") return;
    const products = getProducts().slice(0, 4);
    p2ProductsContainer.innerHTML = "";

    products.forEach((prod) => {
      const card = document.createElement("article");
      card.className = "product-card";
      const emoji = p2GetEmoji(prod.category);
      const priceText = typeof formatPKR === "function" ? formatPKR(prod.price) : `Rs ${prod.price}`;

      card.innerHTML = `
        <a href="html/product.html?id=${encodeURIComponent(prod.id)}" class="p2-home-prod-link">
          <div class="p2-home-prod-img-wrap">
            ${prod.images && prod.images[0] ? `<img src="${prod.images[0]}" alt="${prod.title}">` : `<span>${emoji}</span>`}
          </div>
          <h3 class="p2-home-prod-title">${prod.title}</h3>
          <div class="p2-home-prod-price">${priceText}</div>
        </a>
        <a href="html/product.html?id=${encodeURIComponent(prod.id)}" class="btn-primary">View Details</a>
      `;

      const img = card.querySelector(".p2-home-prod-img-wrap img");
      if (img) {
        img.addEventListener("error", () => {
          img.replaceWith(Object.assign(document.createElement("span"), { textContent: emoji }));
        });
      }

      p2ProductsContainer.appendChild(card);
    });
  }

  p2RenderCategoryChips();
  p2RenderFeaturedShops();
  p2RenderFeaturedProducts();
})();