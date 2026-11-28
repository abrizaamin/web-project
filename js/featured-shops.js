document.title = document.title.replace(/_+SITE_+/, typeof SITE !== "undefined" ? SITE.name : "Whimsy Potli");
(function () {
  const fsQuickCategoryPills = document.getElementById("quickCategoryPills");
  const fsShopsDirectoryView = document.getElementById("shopsDirectoryView");
  const fsShopsGrid = document.getElementById("shopsGrid");
  const fsShopProductsView = document.getElementById("shopProductsView");
  const fsSelectedShopHeading = document.getElementById("selectedShopHeading");
  const fsBackToShopsBtn = document.getElementById("backToShopsBtn");

  const fsSearchInput = document.getElementById("productSearchInput");
  const fsSubcategoryFilter = document.getElementById("subcategoryFilter");
  const fsMinPriceFilter = document.getElementById("minPriceFilter");
  const fsMaxPriceFilter = document.getElementById("maxPriceFilter");
  const fsCityFilter = document.getElementById("cityFilter");
  const fsSortSelect = document.getElementById("sortSelect");
  const fsResetBtn = document.getElementById("resetFiltersBtn");
  const fsGrid = document.getElementById("productsGrid");
  const fsCountText = document.getElementById("productsCountText");

  let activeCategory = "";
  let selectedShopId = "";

  function fsSlug(val) {
    return String(val || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function fsGetEmoji(category) {
    if (typeof CATEGORY_EMOJI !== "undefined" && CATEGORY_EMOJI) {
      if (CATEGORY_EMOJI[category]) return CATEGORY_EMOJI[category];
      const matchKey = Object.keys(CATEGORY_EMOJI).find(
        (k) => fsSlug(k) === fsSlug(category)
      );
      if (matchKey) return CATEGORY_EMOJI[matchKey];
    }
    return "✨";
  }

  function fsReadRawProducts() {
    if (typeof getProducts === "function") {
      const fromFn = getProducts();
      if (Array.isArray(fromFn) && fromFn.length > 0) return fromFn;
    }
    if (typeof PRODUCTS !== "undefined" && Array.isArray(PRODUCTS) && PRODUCTS.length > 0) {
      return PRODUCTS;
    }
    if (Array.isArray(window.PRODUCTS) && window.PRODUCTS.length > 0) {
      return window.PRODUCTS;
    }
    try {
      const stored = JSON.parse(localStorage.getItem("products") || "[]");
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {
      console.warn("Could not parse localStorage products:", e);
    }
    return [];
  }

  function fsReadRawShops() {
    if (typeof getShops === "function") {
      const fromFn = getShops();
      if (Array.isArray(fromFn) && fromFn.length > 0) return fromFn;
    }
    if (typeof SHOPS !== "undefined" && Array.isArray(SHOPS) && SHOPS.length > 0) {
      return SHOPS;
    }
    if (Array.isArray(window.SHOPS) && window.SHOPS.length > 0) {
      return window.SHOPS;
    }
    try {
      const stored = JSON.parse(localStorage.getItem("shops") || "[]");
      if (Array.isArray(stored) && stored.length > 0) return stored;
    } catch (e) {
      console.warn("Could not parse localStorage shops:", e);
    }
    return [];
  }

  function fsGetAllEnrichedProducts() {
    const rawProducts = fsReadRawProducts();
    return rawProducts
      .filter(Boolean)
      .map((p) =>
        window.CatalogDemo && typeof window.CatalogDemo.enrichProduct === "function"
          ? window.CatalogDemo.enrichProduct(p) || p
          : p
      )
      .filter(Boolean);
  }

  function fsGetAllShops() {
    const rawShops = fsReadRawShops();
    const allProds = fsGetAllEnrichedProducts();

    const shopsMap = new Map();
    if (Array.isArray(rawShops)) {
      rawShops.forEach((s) => {
        if (s && s.id) {
          shopsMap.set(String(s.id), { ...s });
        }
      });
    }

    allProds.forEach((prod) => {
      if (prod && prod.shopId && !shopsMap.has(String(prod.shopId))) {
        const seller =
          window.CatalogDemo && typeof window.CatalogDemo.getSellerInfo === "function"
            ? window.CatalogDemo.getSellerInfo(prod.shopId)
            : {};
        shopsMap.set(String(prod.shopId), {
          id: prod.shopId,
          name: seller.businessName || prod.shopId,
          city: seller.city || "Pakistan",
          about: seller.bio || ""
        });
      }
    });

    return Array.from(shopsMap.values()).map((shop) => {
      const seller =
        window.CatalogDemo && typeof window.CatalogDemo.getSellerInfo === "function"
          ? window.CatalogDemo.getSellerInfo(shop.id)
          : {};
      const shopProds = allProds.filter((p) => String(p.shopId) === String(shop.id));
      const categoriesSet = new Set();

      if (Array.isArray(shop.categories)) {
        shop.categories.forEach((c) => c && categoriesSet.add(c));
      }
      if (shop.category) {
        categoriesSet.add(shop.category);
      }
      shopProds.forEach((p) => {
        if (p && p.category) categoriesSet.add(p.category);
      });

      return {
        ...shop,
        displayName: seller.businessName || shop.name || "Maker Shop",
        city: seller.city || shop.city || "Pakistan",
        about: seller.bio || shop.about || "",
        categories: Array.from(categoriesSet),
        productCount: shopProds.length
      };
    });
  }

  function fsShopMatchesCategory(shop, catFilter) {
    if (!catFilter) return true;
    const targetSlug = fsSlug(catFilter);
    return (shop.categories || []).some((c) => fsSlug(c) === targetSlug);
  }

  function fsRenderCategoryPills() {
    if (!fsQuickCategoryPills) return;
    const baseCats =
      typeof CATEGORIES !== "undefined" && Array.isArray(CATEGORIES) && CATEGORIES.length
        ? CATEGORIES
        : ["Crochet", "Scented Candles", "Cakes", "Paintings", "Pipe Cleaners", "Gift Baskets"];

    fsQuickCategoryPills.innerHTML = "";

    const allBtn = document.createElement("button");
    allBtn.type = "button";
    allBtn.className = `p2-pill-btn ${!activeCategory ? "active" : ""}`;
    allBtn.textContent = "All Categories";
    allBtn.addEventListener("click", () => {
      activeCategory = "";
      selectedShopId = "";
      fsSyncUrl();
      fsRenderCategoryPills();
      fsRenderView();
    });
    fsQuickCategoryPills.appendChild(allBtn);

    baseCats.forEach((cat) => {
      const isSelected = fsSlug(activeCategory) === fsSlug(cat);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `p2-pill-btn ${isSelected ? "active" : ""}`;
      btn.textContent = `${fsGetEmoji(cat)} ${cat}`;
      btn.addEventListener("click", () => {
        activeCategory = cat;
        selectedShopId = "";
        fsSyncUrl();
        fsRenderCategoryPills();
        fsRenderView();
      });
      fsQuickCategoryPills.appendChild(btn);
    });
  }

  function fsPopulateCitySelect() {
    if (typeof CITIES === "undefined" || !Array.isArray(CITIES) || !fsCityFilter) return;
    const current = fsCityFilter.value;
    fsCityFilter.innerHTML = `<option value="">Any City</option>`;
    CITIES.forEach((city) => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      fsCityFilter.appendChild(opt);
    });
    if (current) fsCityFilter.value = current;
  }

  function fsPopulateSubcategoriesForShop(shopProducts) {
    if (!fsSubcategoryFilter) return;
    fsSubcategoryFilter.innerHTML = `<option value="">All Subcategories</option>`;

    const subMap = new Map();
    shopProducts.forEach((prod) => {
      if (prod.subcategory || prod.subcategoryName) {
        const key = prod.subcategory || fsSlug(prod.subcategoryName);
        if (!subMap.has(key)) {
          subMap.set(key, prod.subcategoryName || prod.subcategory);
        }
      }
    });

    if (window.CatalogDemo && typeof window.CatalogDemo.getSubcategoriesForCategory === "function") {
      const shopCats = Array.from(new Set(shopProducts.map((p) => p.category).filter(Boolean)));
      shopCats.forEach((cat) => {
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
      fsSubcategoryFilter.appendChild(opt);
    });
  }

  function fsCanDeliverToCity(product, city) {
    if (!city) return true;
    if (product.isBakingItem && fsSlug(city) !== "lahore") return false;
    const shop = typeof getShop === "function" ? getShop(product.shopId) : null;
    if (!shop || !shop.deliveryCities) return true;
    if (Array.isArray(shop.deliveryCities)) {
      return shop.deliveryCities.some((c) => fsSlug(c) === fsSlug(city));
    }
    return shop.deliveryCities[city] !== undefined;
  }

  function fsRenderShopsList() {
    if (!fsShopsGrid) return;
    const shops = fsGetAllShops().filter((s) => fsShopMatchesCategory(s, activeCategory));

    if (fsCountText) {
      fsCountText.textContent = `Showing ${shops.length} ${shops.length === 1 ? "shop" : "shops"}`;
    }

    fsShopsGrid.innerHTML = "";

    if (!shops.length) {
      fsShopsGrid.innerHTML = `<div class="p2-empty-state">No shops found for this category yet.</div>`;
      return;
    }

    shops.forEach((shop) => {
      const card = document.createElement("article");
      card.className = "shop-card";

      const catBadges = (shop.categories || [])
        .map((c) => `<span class="shop-cat-tag">${fsGetEmoji(c)} ${c}</span>`)
        .join("");

      card.innerHTML = `
        <div class="shop-card-body">
          <h2 class="shop-card-title">${shop.displayName}</h2>
          <div class="shop-card-city">📍 ${shop.city}</div>
          ${catBadges ? `<div class="shop-card-cats">${catBadges}</div>` : ""}
          ${shop.about ? `<p class="shop-card-about">${shop.about}</p>` : ""}
          <div class="shop-card-meta">${shop.productCount} ${shop.productCount === 1 ? "product" : "products"}</div>
        </div>
        <button type="button" class="btn-primary shop-select-btn" data-shop-id="${shop.id}">
          View Shop Products
        </button>
      `;

      const selectBtn = card.querySelector(".shop-select-btn");
      if (selectBtn) {
        selectBtn.addEventListener("click", () => {
          selectedShopId = String(shop.id);
          fsResetShopFiltersOnly();
          const shopProds = fsGetAllEnrichedProducts().filter(
            (p) => String(p.shopId) === selectedShopId
          );
          fsPopulateSubcategoriesForShop(shopProds);
          fsSyncUrl();
          fsRenderView();
        });
      }

      fsShopsGrid.appendChild(card);
    });
  }

  function fsResetShopFiltersOnly() {
    if (fsSearchInput) fsSearchInput.value = "";
    if (fsSubcategoryFilter) fsSubcategoryFilter.value = "";
    if (fsMinPriceFilter) fsMinPriceFilter.value = "";
    if (fsMaxPriceFilter) fsMaxPriceFilter.value = "";
    if (fsCityFilter) fsCityFilter.value = "";
    if (fsSortSelect) fsSortSelect.value = "newest";
  }

  function fsFilterAndSortShopProducts() {
    const allShops = fsGetAllShops();
    const currentShop = allShops.find((s) => String(s.id) === String(selectedShopId));

    if (!currentShop) {
      selectedShopId = "";
      fsRenderView();
      return;
    }

    if (fsSelectedShopHeading) {
      fsSelectedShopHeading.textContent = currentShop.displayName;
    }

    const shopProducts = fsGetAllEnrichedProducts().filter(
      (prod) => String(prod.shopId) === String(selectedShopId)
    );

    const query = (fsSearchInput ? fsSearchInput.value : "").trim().toLowerCase();
    const selectedSub = fsSubcategoryFilter ? fsSubcategoryFilter.value : "";
    const minPriceVal =
      fsMinPriceFilter && fsMinPriceFilter.value !== "" ? Number(fsMinPriceFilter.value) : null;
    const maxPriceVal =
      fsMaxPriceFilter && fsMaxPriceFilter.value !== "" ? Number(fsMaxPriceFilter.value) : null;
    const selectedCity = fsCityFilter ? fsCityFilter.value : "";
    const sortBy = fsSortSelect ? fsSortSelect.value : "newest";

    const filtered = shopProducts.filter((prod) => {
      if (query) {
        const titleMatch = (prod.title || "").toLowerCase().includes(query);
        const subMatch = (prod.subcategoryName || "").toLowerCase().includes(query);
        const tagsArray = Array.isArray(prod.tags) ? prod.tags : [];
        const tagMatch = tagsArray.some((tag) => String(tag).toLowerCase().includes(query));
        if (!titleMatch && !subMatch && !tagMatch) return false;
      }

      if (selectedSub) {
        const prodSubSlug = fsSlug(prod.subcategory || prod.subcategoryName);
        if (prodSubSlug !== fsSlug(selectedSub)) return false;
      }

      const price = Number(prod.price) || 0;
      if (minPriceVal !== null && !Number.isNaN(minPriceVal) && price < minPriceVal) {
        return false;
      }
      if (maxPriceVal !== null && !Number.isNaN(maxPriceVal) && price > maxPriceVal) {
        return false;
      }

      if (!fsCanDeliverToCity(prod, selectedCity)) {
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

    if (fsCountText) {
      fsCountText.textContent = `${currentShop.displayName} · ${filtered.length} ${filtered.length === 1 ? "product" : "products"}`;
    }

    fsRenderProductsGrid(filtered, currentShop.displayName);
  }

  function fsRenderProductsGrid(items, shopDisplayName) {
    if (!fsGrid) return;
    fsGrid.innerHTML = "";

    if (!items.length) {
      fsGrid.innerHTML = `<div class="p2-empty-state">No products match your search or filters in ${shopDisplayName}.</div>`;
      return;
    }

    items.forEach((prod) => {
      const card = document.createElement("article");
      card.className = "product-card";

      const imgPath = Array.isArray(prod.images) && prod.images[0] ? `../${prod.images[0]}` : "";
      const emoji = fsGetEmoji(prod.category);
      const priceText = typeof formatPKR === "function" ? formatPKR(prod.price) : `Rs ${prod.price}`;
      const stockText = Number(prod.stock) > 0 ? `${prod.stock} in stock` : "Out of stock";
      const subText = prod.subcategoryName ? ` · ${prod.subcategoryName}` : "";

      card.innerHTML = `
        <a href="product.html?id=${encodeURIComponent(prod.id)}" class="p2-card-link">
          <div class="p2-thumb-wrap">
            ${imgPath ? `<img src="${imgPath}" alt="${prod.title}" class="p2-thumb-img">` : `<span class="p2-emoji-fallback">${emoji}</span>`}
          </div>
          <h3 class="p2-card-title">${prod.title}</h3>
          <div class="p2-card-meta">${emoji} ${prod.category || ""}${subText}</div>
          <div class="p2-card-seller">by ${shopDisplayName}</div>
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

      fsGrid.appendChild(card);
    });
  }

  function fsRenderView() {
    if (selectedShopId) {
      if (fsShopsDirectoryView) fsShopsDirectoryView.hidden = true;
      if (fsShopProductsView) fsShopProductsView.hidden = false;
      fsFilterAndSortShopProducts();
    } else {
      if (fsShopsDirectoryView) fsShopsDirectoryView.hidden = false;
      if (fsShopProductsView) fsShopProductsView.hidden = true;
      fsRenderShopsList();
    }
  }

  function fsSyncUrl() {
    const url = new URL(window.location.href);
    if (activeCategory) url.searchParams.set("category", activeCategory);
    else url.searchParams.delete("category");

    if (selectedShopId) url.searchParams.set("shop", selectedShopId);
    else url.searchParams.delete("shop");

    window.history.replaceState({}, "", url);
  }

  function fsApplyInitialUrl() {
    const params = new URLSearchParams(window.location.search);
    activeCategory = params.get("category") || "";
    selectedShopId = params.get("shop") || params.get("shopId") || "";

    if (selectedShopId) {
      const shopProds = fsGetAllEnrichedProducts().filter(
        (p) => String(p.shopId) === String(selectedShopId)
      );
      fsPopulateSubcategoriesForShop(shopProds);
    }
  }

  function fsBoot() {
    fsPopulateCitySelect();
    fsApplyInitialUrl();
    fsRenderCategoryPills();
    fsRenderView();
  }

  fsBoot();
  window.addEventListener("DOMContentLoaded", fsBoot);
  window.addEventListener("load", fsBoot);

  if (fsBackToShopsBtn) {
    fsBackToShopsBtn.addEventListener("click", () => {
      selectedShopId = "";
      fsResetShopFiltersOnly();
      fsSyncUrl();
      fsRenderView();
    });
  }

  [fsSearchInput, fsSubcategoryFilter, fsMinPriceFilter, fsMaxPriceFilter, fsCityFilter, fsSortSelect].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", () => {
      if (selectedShopId) fsFilterAndSortShopProducts();
    });
    el.addEventListener("change", () => {
      if (selectedShopId) fsFilterAndSortShopProducts();
    });
  });

  if (fsResetBtn) {
    fsResetBtn.addEventListener("click", () => {
      fsResetShopFiltersOnly();
      if (selectedShopId) fsFilterAndSortShopProducts();
    });
  }
})();