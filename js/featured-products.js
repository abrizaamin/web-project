document.title = document.title.replace(/_+SITE_+/, typeof SITE !== "undefined" ? SITE.name : "Whimsy Potli");
(function () {
  const fpGrid = document.getElementById("featuredProductsGrid");
  const fpCount = document.getElementById("featuredProductsCount");
  const fpKeywordInput = document.getElementById("fpKeywordInput");
  const fpCategorySelect = document.getElementById("fpCategorySelect");
  const fpSubcategorySelect = document.getElementById("fpSubcategorySelect");
  const fpMinPrice = document.getElementById("fpMinPrice");
  const fpMaxPrice = document.getElementById("fpMaxPrice");
  const fpCitySelect = document.getElementById("fpCitySelect");
  const fpSortSelect = document.getElementById("fpSortSelect");
  const fpResetBtn = document.getElementById("fpResetBtn");

  function fpSlug(val) {
    return String(val || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function fpGetEmoji(category) {
    if (typeof CATEGORY_EMOJI !== "undefined" && CATEGORY_EMOJI) {
      if (CATEGORY_EMOJI[category]) return CATEGORY_EMOJI[category];
      const matchKey = Object.keys(CATEGORY_EMOJI).find(
        (k) => fpSlug(k) === fpSlug(category)
      );
      if (matchKey) return CATEGORY_EMOJI[matchKey];
    }
    return "✨";
  }

  function fpGetCategories() {
    if (typeof CATEGORIES !== "undefined" && Array.isArray(CATEGORIES) && CATEGORIES.length) {
      return CATEGORIES;
    }
    return ["Crochet", "Scented Candles", "Cakes", "Paintings", "Pipe Cleaners", "Gift Baskets"];
  }

  function fpReadRawProducts() {
    // 1. Primary helper from data.js
    if (typeof getProducts === "function") {
      const fromFn = getProducts();
      if (Array.isArray(fromFn) && fromFn.length > 0) return fromFn;
    }
    // 2. Global PRODUCTS array if declared in data.js
    if (typeof PRODUCTS !== "undefined" && Array.isArray(PRODUCTS) && PRODUCTS.length > 0) {
      return PRODUCTS;
    }
    if (Array.isArray(window.PRODUCTS) && window.PRODUCTS.length > 0) {
      return window.PRODUCTS;
    }
    // 3. Direct localStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem("products") || "[]");
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {
      console.warn("Could not parse localStorage products:", e);
    }
    return [];
  }

  function fpGetAllProducts() {
    const raw = fpReadRawProducts();
    return raw
      .filter(Boolean)
      .map((prod) => {
        if (window.CatalogDemo && typeof window.CatalogDemo.enrichProduct === "function") {
          return window.CatalogDemo.enrichProduct(prod) || prod;
        }
        return prod;
      })
      .filter(Boolean);
  }

  function fpGetSellerName(prod) {
    if (prod.seller && prod.seller.businessName) return prod.seller.businessName;
    if (typeof getShop === "function" && prod.shopId) {
      const shop = getShop(prod.shopId);
      if (shop && shop.name) return shop.name;
    }
    return "Maker Shop";
  }

  function fpCanDeliverToCity(product, city) {
    if (!city) return true;
    if (product.isBakingItem && fpSlug(city) !== "lahore") return false;
    const shop = typeof getShop === "function" ? getShop(product.shopId) : null;
    if (!shop || !shop.deliveryCities) return true;
    if (Array.isArray(shop.deliveryCities)) {
      return shop.deliveryCities.some((c) => fpSlug(c) === fpSlug(city));
    }
    return shop.deliveryCities[city] !== undefined;
  }

  function fpPopulateCategories() {
    if (!fpCategorySelect) return;
    const current = fpCategorySelect.value;
    fpCategorySelect.innerHTML = `<option value="">All Categories</option>`;
    fpGetCategories().forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      fpCategorySelect.appendChild(opt);
    });
    if (current) fpCategorySelect.value = current;
  }

  function fpPopulateSubcategories(categoryFilter) {
    if (!fpSubcategorySelect) return;
    const previousVal = fpSubcategorySelect.value;
    fpSubcategorySelect.innerHTML = `<option value="">All Subcategories</option>`;

    const subMap = new Map();
    const allProds = fpGetAllProducts();

    allProds.forEach((prod) => {
      if (categoryFilter && fpSlug(prod.category) !== fpSlug(categoryFilter)) return;
      if (prod.subcategory || prod.subcategoryName) {
        const key = prod.subcategory || fpSlug(prod.subcategoryName);
        if (!subMap.has(key)) {
          subMap.set(key, prod.subcategoryName || prod.subcategory);
        }
      }
    });

    if (window.CatalogDemo && typeof window.CatalogDemo.getSubcategoriesForCategory === "function") {
      const cats = categoryFilter
        ? fpGetCategories().filter((c) => fpSlug(c) === fpSlug(categoryFilter))
        : fpGetCategories();
      cats.forEach((cat) => {
        window.CatalogDemo.getSubcategoriesForCategory(cat).forEach((sub) => {
          if (!subMap.has(sub.id)) {
            subMap.set(sub.id, sub.name);
          }
        });
      });
    }

    subMap.forEach((label, id) => {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = label;
      fpSubcategorySelect.appendChild(opt);
    });

    if (previousVal && Array.from(fpSubcategorySelect.options).some((o) => o.value === previousVal)) {
      fpSubcategorySelect.value = previousVal;
    } else {
      fpSubcategorySelect.value = "";
    }
  }

  function fpPopulateCities() {
    if (!fpCitySelect || typeof CITIES === "undefined" || !Array.isArray(CITIES)) return;
    const current = fpCitySelect.value;
    fpCitySelect.innerHTML = `<option value="">Any City</option>`;
    CITIES.forEach((city) => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      fpCitySelect.appendChild(opt);
    });
    if (current) fpCitySelect.value = current;
  }

  function fpApplyFiltersAndRender() {
    if (!fpGrid) return;
    const products = fpGetAllProducts();

    const keyword = (fpKeywordInput ? fpKeywordInput.value : "").trim().toLowerCase();
    const category = fpCategorySelect ? fpCategorySelect.value : "";
    const subcategory = fpSubcategorySelect ? fpSubcategorySelect.value : "";
    const minPrice = fpMinPrice && fpMinPrice.value !== "" ? Number(fpMinPrice.value) : null;
    const maxPrice = fpMaxPrice && fpMaxPrice.value !== "" ? Number(fpMaxPrice.value) : null;
    const city = fpCitySelect ? fpCitySelect.value : "";
    const sortBy = fpSortSelect ? fpSortSelect.value : "newest";

    const filtered = products.filter((prod) => {
      if (category && fpSlug(prod.category) !== fpSlug(category)) {
        return false;
      }

      if (subcategory && fpSlug(prod.subcategory || prod.subcategoryName) !== fpSlug(subcategory)) {
        return false;
      }

      if (keyword) {
        const titleMatch = (prod.title || "").toLowerCase().includes(keyword);
        const catMatch = (prod.category || "").toLowerCase().includes(keyword);
        const subMatch = (prod.subcategoryName || "").toLowerCase().includes(keyword);
        const tags = Array.isArray(prod.tags) ? prod.tags : [];
        const tagMatch = tags.some((t) => String(t).toLowerCase().includes(keyword));
        if (!titleMatch && !catMatch && !subMatch && !tagMatch) return false;
      }

      const price = Number(prod.price) || 0;
      if (minPrice !== null && !Number.isNaN(minPrice) && price < minPrice) return false;
      if (maxPrice !== null && !Number.isNaN(maxPrice) && price > maxPrice) return false;

      if (!fpCanDeliverToCity(prod, city)) return false;

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

    if (fpCount) {
      fpCount.textContent = `Showing ${filtered.length} ${filtered.length === 1 ? "product" : "products"}`;
    }

    fpGrid.innerHTML = "";
    if (!filtered.length) {
      fpGrid.innerHTML = `<div class="p2-empty-state">No products match your selected filters.</div>`;
      return;
    }

    filtered.forEach((prod) => {
      const card = document.createElement("article");
      card.className = "product-card";

      const imgPath = Array.isArray(prod.images) && prod.images[0] ? `../${prod.images[0]}` : "";
      const emoji = fpGetEmoji(prod.category);
      const priceText = typeof formatPKR === "function" ? formatPKR(prod.price) : `Rs ${prod.price}`;
      const stockText = Number(prod.stock) > 0 ? `${prod.stock} in stock` : "Out of stock";
      const subText = prod.subcategoryName ? ` · ${prod.subcategoryName}` : "";
      const sellerName = fpGetSellerName(prod);

      card.innerHTML = `
        <a href="product.html?id=${encodeURIComponent(prod.id)}" class="p2-card-link">
          <div class="p2-thumb-wrap">
            ${imgPath ? `<img src="${imgPath}" alt="${prod.title}" class="p2-thumb-img">` : `<span class="p2-emoji-fallback">${emoji}</span>`}
          </div>
          <h3 class="p2-card-title">${prod.title}</h3>
          <div class="p2-card-meta">${emoji} ${prod.category || ""}${subText}</div>
          <div class="p2-card-seller">by ${sellerName}</div>
          <div class="p2-card-footer-row">
            <div class="p2-card-price">${priceText}</div>
            <span class="badge-stock">${stockText}</span>
          </div>
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

      fpGrid.appendChild(card);
    });
  }

  function fpResetAll() {
    if (fpKeywordInput) fpKeywordInput.value = "";
    if (fpCategorySelect) fpCategorySelect.value = "";
    fpPopulateSubcategories("");
    if (fpSubcategorySelect) fpSubcategorySelect.value = "";
    if (fpMinPrice) fpMinPrice.value = "";
    if (fpMaxPrice) fpMaxPrice.value = "";
    if (fpCitySelect) fpCitySelect.value = "";
    if (fpSortSelect) fpSortSelect.value = "newest";
    fpApplyFiltersAndRender();
  }

  function fpApplyInitialQuery() {
  const params = new URLSearchParams(window.location.search);
  const catParam = params.get("category") || "";
  const subParam = params.get("sub") || "";

  if (fpCategorySelect && catParam) {
    const matchedCat = Array.from(fpCategorySelect.options).find(
      (opt) => fpSlug(opt.value) === fpSlug(catParam) || fpSlug(opt.textContent) === fpSlug(catParam)
    );
    fpCategorySelect.value = matchedCat ? matchedCat.value : catParam;
  }

  fpPopulateSubcategories(fpCategorySelect ? fpCategorySelect.value : catParam);

  if (fpSubcategorySelect && subParam) {
    const matchedSub = Array.from(fpSubcategorySelect.options).find(
      (opt) => fpSlug(opt.value) === fpSlug(subParam) || fpSlug(opt.textContent) === fpSlug(subParam)
    );
    fpSubcategorySelect.value = matchedSub ? matchedSub.value : subParam;
  }
}

  function fpBoot() {
    fpPopulateCategories();
    fpPopulateCities();
    fpApplyInitialQuery();
    fpApplyFiltersAndRender();
  }

  fpBoot();
  window.addEventListener("load", fpBoot);

  if (fpCategorySelect) {
    fpCategorySelect.addEventListener("change", () => {
      fpPopulateSubcategories(fpCategorySelect.value);
      fpApplyFiltersAndRender();
    });
  }

  [fpKeywordInput, fpMinPrice, fpMaxPrice].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", fpApplyFiltersAndRender);
  });

  [fpSubcategorySelect, fpCitySelect, fpSortSelect].forEach((el) => {
    if (!el) return;
    el.addEventListener("change", fpApplyFiltersAndRender);
  });

  if (fpResetBtn) {
    fpResetBtn.addEventListener("click", fpResetAll);
  }
})();