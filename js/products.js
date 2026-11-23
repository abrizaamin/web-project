document.title = document.title.replace(/_+SITE_+/, SITE.name);
(function () {
  const p2SearchInput = document.getElementById("productSearchInput");
  const p2CategoryFilter = document.getElementById("categoryFilter");
  const p2MinPriceFilter = document.getElementById("minPriceFilter");
  const p2MaxPriceFilter = document.getElementById("maxPriceFilter");
  const p2CityFilter = document.getElementById("cityFilter");
  const p2SortSelect = document.getElementById("sortSelect");
  const p2ResetBtn = document.getElementById("resetFiltersBtn");
  const p2Grid = document.getElementById("productsGrid");
  const p2CountText = document.getElementById("productsCountText");

  function p2GetEmoji(category) {
    if (typeof CATEGORY_EMOJI !== "undefined" && CATEGORY_EMOJI[category]) {
      return CATEGORY_EMOJI[category];
    }
    return "✨";
  }

  function p2CanDeliverToCity(product, city) {
    if (!city) return true;
    if (product.isBakingItem && city !== "Lahore") return false;
    const shop = typeof getShop === "function" ? getShop(product.shopId) : null;
    if (!shop || !shop.deliveryCities) return false;
    return shop.deliveryCities[city] !== undefined;
  }

  function p2PopulateSelects() {
    if (typeof CATEGORIES !== "undefined" && Array.isArray(CATEGORIES) && p2CategoryFilter) {
      CATEGORIES.forEach((cat) => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = `${p2GetEmoji(cat)} ${cat}`;
        p2CategoryFilter.appendChild(opt);
      });
    }

    if (typeof CITIES !== "undefined" && Array.isArray(CITIES) && p2CityFilter) {
      CITIES.forEach((city) => {
        const opt = document.createElement("option");
        opt.value = city;
        opt.textContent = city;
        p2CityFilter.appendChild(opt);
      });
    }
  }

  function p2ApplyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get("category");
    const queryParam = params.get("q");

    if (categoryParam && p2CategoryFilter) {
      p2CategoryFilter.value = categoryParam;
    }
    if (queryParam && p2SearchInput) {
      p2SearchInput.value = queryParam;
    }
  }

  function p2FilterAndSortProducts() {
    const allProducts = typeof getProducts === "function" ? getProducts() : [];
    const query = (p2SearchInput ? p2SearchInput.value : "").trim().toLowerCase();
    const selectedCategory = p2CategoryFilter ? p2CategoryFilter.value : "";
    const minPriceVal = p2MinPriceFilter && p2MinPriceFilter.value !== "" ? Number(p2MinPriceFilter.value) : null;
    const maxPriceVal = p2MaxPriceFilter && p2MaxPriceFilter.value !== "" ? Number(p2MaxPriceFilter.value) : null;
    const selectedCity = p2CityFilter ? p2CityFilter.value : "";
    const sortBy = p2SortSelect ? p2SortSelect.value : "newest";

    const filtered = allProducts.filter((prod) => {
      if (query) {
        const titleMatch = (prod.title || "").toLowerCase().includes(query);
        const tagsArray = Array.isArray(prod.tags) ? prod.tags : [];
        const tagMatch = tagsArray.some((tag) => String(tag).toLowerCase().includes(query));
        if (!titleMatch && !tagMatch) return false;
      }

      if (selectedCategory && prod.category !== selectedCategory) {
        return false;
      }

      const price = Number(prod.price) || 0;
      if (minPriceVal !== null && !Number.isNaN(minPriceVal) && price < minPriceVal) {
        return false;
      }
      if (maxPriceVal !== null && !Number.isNaN(maxPriceVal) && price > maxPriceVal) {
        return false;
      }

      if (!p2CanDeliverToCity(prod, selectedCity)) {
        return false;
      }

      return true;
    });

    if (sortBy === "price-asc") {
      filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else {
      filtered.sort((a, b) => {
        const numA = parseInt(String(a.id || "").replace(/\D+/g, ""), 10) || 0;
        const numB = parseInt(String(b.id || "").replace(/\D+/g, ""), 10) || 0;
        return numB - numA;
      });
    }

    p2RenderProducts(filtered);
  }

  function p2RenderProducts(items) {
    if (!p2Grid) return;

    if (p2CountText) {
      p2CountText.textContent = `Showing ${items.length} ${items.length === 1 ? "product" : "products"}`;
    }

    p2Grid.innerHTML = "";

    if (!items.length) {
      p2Grid.innerHTML = `<div class="p2-empty-state">No products match your search or filters.</div>`;
      return;
    }

    items.forEach((prod) => {
      const card = document.createElement("article");
      card.className = "product-card";

      const imgPath = Array.isArray(prod.images) && prod.images[0] ? `../${prod.images[0]}` : "";
      const emoji = p2GetEmoji(prod.category);
      const shop = typeof getShop === "function" ? getShop(prod.shopId) : null;
      const shopName = shop ? shop.name : "Maker Shop";
      const priceText = typeof formatPKR === "function" ? formatPKR(prod.price) : `Rs ${prod.price}`;
      const stockText = Number(prod.stock) > 0 ? `${prod.stock} in stock` : "Out of stock";

      card.innerHTML = `
        <a href="product.html?id=${encodeURIComponent(prod.id)}" class="p2-card-link">
          <div class="p2-thumb-wrap">
            ${imgPath ? `<img src="${imgPath}" alt="${prod.title}" class="p2-thumb-img">` : `<span class="p2-emoji-fallback">${emoji}</span>`}
          </div>
          <h2 class="p2-card-title">${prod.title}</h2>
          <div class="p2-card-meta">${emoji} ${prod.category || ""} · ${shopName}</div>
          <div class="p2-card-price">${priceText}</div>
          <span class="badge-stock">${stockText}</span>
        </a>
        <div class="p2-card-actions">
          <a href="product.html?id=${encodeURIComponent(prod.id)}" class="btn-primary">View Details</a>
        </div>
      `;

      const imgEl = card.querySelector(".p2-thumb-img");
      if (imgEl) {
        imgEl.addEventListener("error", () => {
          imgEl.replaceWith(Object.assign(document.createElement("span"), {
            className: "p2-emoji-fallback",
            textContent: emoji
          }));
        });
      }

      p2Grid.appendChild(card);
    });
  }

  p2PopulateSelects();
  p2ApplyUrlParams();
  p2FilterAndSortProducts();

  [p2SearchInput, p2CategoryFilter, p2MinPriceFilter, p2MaxPriceFilter, p2CityFilter, p2SortSelect].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", p2FilterAndSortProducts);
    el.addEventListener("change", p2FilterAndSortProducts);
  });

  if (p2ResetBtn) {
    p2ResetBtn.addEventListener("click", () => {
      if (p2SearchInput) p2SearchInput.value = "";
      if (p2CategoryFilter) p2CategoryFilter.value = "";
      if (p2MinPriceFilter) p2MinPriceFilter.value = "";
      if (p2MaxPriceFilter) p2MaxPriceFilter.value = "";
      if (p2CityFilter) p2CityFilter.value = "";
      if (p2SortSelect) p2SortSelect.value = "newest";
      p2FilterAndSortProducts();
    });
  }
})();