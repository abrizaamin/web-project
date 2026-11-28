document.title = document.title.replace(/_+SITE_+/, typeof SITE !== "undefined" ? SITE.name : "Whimsy Potli");
(function () {
  const p2ChipsContainer = document.getElementById("homeCategoryChips");
  const p2ShopsContainer = document.getElementById("homeFeaturedShops");
  const p2ProductsContainer = document.getElementById("homeFeaturedProducts");

  function p2Slug(val) {
    return String(val || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function p2GetEmoji(category) {
    if (typeof CATEGORY_EMOJI !== "undefined" && CATEGORY_EMOJI) {
      if (CATEGORY_EMOJI[category]) return CATEGORY_EMOJI[category];
      const matchKey = Object.keys(CATEGORY_EMOJI).find(
        (k) => p2Slug(k) === p2Slug(category)
      );
      if (matchKey) return CATEGORY_EMOJI[matchKey];
    }
    return "✨";
  }

  function p2GetSubcategoriesSafe(cat) {
    if (!window.CatalogDemo || typeof window.CatalogDemo.getSubcategoriesForCategory !== "function") {
      return [];
    }
    let subs = window.CatalogDemo.getSubcategoriesForCategory(cat) || [];
    if (!subs.length && window.CatalogDemo.SUBCATEGORIES_BY_CATEGORY) {
      const target = p2Slug(cat);
      const matchedKey = Object.keys(window.CatalogDemo.SUBCATEGORIES_BY_CATEGORY).find(
        (key) => p2Slug(key) === target || p2Slug(key).startsWith(target) || target.startsWith(p2Slug(key))
      );
      if (matchedKey) {
        subs = window.CatalogDemo.SUBCATEGORIES_BY_CATEGORY[matchedKey] || [];
      }
    }
    return subs;
  }

  function p2RenderCategoryChips() {
    if (!p2ChipsContainer || typeof CATEGORIES === "undefined" || !Array.isArray(CATEGORIES)) return;
    p2ChipsContainer.innerHTML = "";

    const allSubchips = [];

    CATEGORIES.forEach((cat) => {
      const link = document.createElement("a");
      link.href = `html/featured-products.html?category=${encodeURIComponent(cat)}`;
      link.className = "p2-category-chip";
      link.textContent = `${p2GetEmoji(cat)} ${cat}`;
      p2ChipsContainer.appendChild(link);

      p2GetSubcategoriesSafe(cat).forEach((sub) => {
        allSubchips.push({ cat, sub });
      });
    });

    if (allSubchips.length) {
      let subRow = document.getElementById("homeSubcategoryChips");
      if (!subRow) {
        subRow = document.createElement("div");
        subRow.id = "homeSubcategoryChips";
        subRow.className = "home-subchips-row";
        subRow.setAttribute("aria-label", "Popular subcategories");
        p2ChipsContainer.insertAdjacentElement("afterend", subRow);
      }
      subRow.innerHTML = "";

      allSubchips.forEach(({ cat, sub }) => {
        const subLink = document.createElement("a");
        subLink.href = `html/featured-products.html?category=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub.id)}`;
        subLink.className = "p2-home-subchip";
        const imgHtml = sub.image
          ? `<img src="${sub.image}" alt="${sub.name}" class="p2-home-subchip-img">`
          : `<span>${sub.emoji || "✨"}</span>`;
        subLink.innerHTML = `${imgHtml}<span>${sub.name}</span>`;

        const imgEl = subLink.querySelector(".p2-home-subchip-img");
        if (imgEl) {
          imgEl.addEventListener("error", () => {
            imgEl.replaceWith(Object.assign(document.createElement("span"), { textContent: sub.emoji || "✨" }));
          });
        }

        subRow.appendChild(subLink);
      });
    }
  }

  function p2RenderFeaturedShops() {
    if (!p2ShopsContainer || typeof getShops !== "function") return;
    const shops = getShops().slice(0, 3);
    p2ShopsContainer.innerHTML = "";

    shops.forEach((shop) => {
      const groups =
        window.CatalogDemo && typeof window.CatalogDemo.buildShopCatalogGroups === "function"
          ? window.CatalogDemo.buildShopCatalogGroups(shop.id)
          : [];

      const catChipsHtml = groups.length
        ? groups
            .map(
              (g) =>
                `<a href="html/featured-products.html?category=${encodeURIComponent(g.category)}" class="p2-shop-cat-chip">${p2GetEmoji(g.category)} ${g.category}</a>`
            )
            .join("")
        : `<span class="p2-shop-cat-chip">✨ Handmade</span>`;

      const card = document.createElement("article");
      card.className = "p2-shop-card";
      card.innerHTML = `
        <div>
          <h3>${shop.name}</h3>
          <span class="p2-shop-city">📍 ${shop.city || "Pakistan"}</span>
          <div class="p2-shop-cat-chips">${catChipsHtml}</div>
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
      const enriched =
        window.CatalogDemo && typeof window.CatalogDemo.enrichProduct === "function"
          ? window.CatalogDemo.enrichProduct(prod)
          : prod;
      const card = document.createElement("article");
      card.className = "product-card";
      const emoji = p2GetEmoji(enriched.category);
      const priceText = typeof formatPKR === "function" ? formatPKR(enriched.price) : `Rs ${enriched.price}`;
      const sellerName = (enriched.seller && enriched.seller.businessName) || "";

      card.innerHTML = `
        <a href="html/product.html?id=${encodeURIComponent(enriched.id)}" class="p2-home-prod-link">
          <div class="p2-home-prod-img-wrap">
            ${enriched.images && enriched.images[0] ? `<img src="${enriched.images[0]}" alt="${enriched.title}">` : `<span>${emoji}</span>`}
          </div>
          <h3 class="p2-home-prod-title">${enriched.title}</h3>
          ${sellerName ? `<div class="p2-home-prod-seller">by ${sellerName}</div>` : ""}
          <div class="p2-home-prod-price">${priceText}</div>
        </a>
        <a href="html/product.html?id=${encodeURIComponent(enriched.id)}" class="btn-primary">View Details</a>
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