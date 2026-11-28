document.title = document.title.replace(/_+SITE_+/, SITE.name);
(function () {
  const p2DetailContainer = document.getElementById("productDetailContainer");

  function p2GetEmoji(category) {
    if (typeof CATEGORY_EMOJI !== "undefined" && CATEGORY_EMOJI && CATEGORY_EMOJI[category]) {
      return CATEGORY_EMOJI[category];
    }
    return "✨";
  }

  function p2EscapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function p2RenderMissing() {
    if (!p2DetailContainer) return;
    p2DetailContainer.innerHTML = `
      <div class="not-found-box">
        <h2>Product not found</h2>
        <p>This item isn't available anymore or the link is missing an ID.</p>
        <a href="products.html" class="btn-primary">Browse All Products</a>
      </div>
    `;
  }

  function p2BuildDeliveryPanel(product, seller) {
    const cityList =
      product.isBakingItem
        ? ["Lahore (Local delivery only)"]
        : Array.isArray(CITIES) && CITIES.length
          ? CITIES
          : ["Lahore", "Islamabad", "Karachi"];

    const readyText =
      typeof product.readyInDays === "number"
        ? `Ready in ${product.readyInDays} ${product.readyInDays === 1 ? "day" : "days"}, then dispatched to your door.`
        : "Crafted in small batches; check item details for lead time.";

    return `
      <div class="info-panel-card">
        <p><strong>Dispatch:</strong> ${p2EscapeHtml(readyText)}</p>
        <p><strong>Cities:</strong> ${p2EscapeHtml(cityList.join(", "))}</p>
        <p><strong>Payment:</strong> Cash on delivery, bank transfer, JazzCash, or Easypaisa.</p>
        ${seller.bio ? `<p><strong>Maker Note:</strong> ${p2EscapeHtml(seller.bio)}</p>` : ""}
      </div>
    `;
  }

  function p2BuildSellerPanel(product, seller) {
    const shopHref = `shop.html?id=${encodeURIComponent(product.shopId || "")}`;
    const links = [];
    if (seller.instagram) {
      const label = seller.instagramHandle ? `Instagram (${seller.instagramHandle})` : "Instagram";
      links.push(`<a href="${p2EscapeHtml(seller.instagram)}" target="_blank" rel="noopener noreferrer" class="seller-link-chip">${p2EscapeHtml(label)}</a>`);
    }
    if (seller.website) {
      links.push(`<a href="${p2EscapeHtml(seller.website)}" target="_blank" rel="noopener noreferrer" class="seller-link-chip">Website</a>`);
    }
    if (seller.whatsapp) {
      links.push(`<a href="${p2EscapeHtml(seller.whatsapp)}" target="_blank" rel="noopener noreferrer" class="seller-link-chip">WhatsApp</a>`);
    }

    return `
      <div class="info-panel-card">
        <p><strong>Business Name:</strong> ${p2EscapeHtml(seller.businessName)}</p>
        <p><strong>City:</strong> ${p2EscapeHtml(seller.city || "Pakistan")}</p>
        <p>${p2EscapeHtml(seller.bio || "")}</p>
        ${links.length ? `<div class="seller-links-row">${links.join("")}</div>` : `<p class="muted-small">No external links listed yet.</p>`}
        <div class="seller-panel-cta">
          <a href="${shopHref}" class="btn-primary visit-shop-link">Visit Shop</a>
        </div>
      </div>
    `;
  }

  function p2BuildSoldByCard(product, seller, fallbackEmoji) {
    const shopHref = `shop.html?id=${encodeURIComponent(product.shopId || "")}`;
    const logoSrc = seller.logo ? `../${seller.logo}` : "";
    const links = [];

    if (seller.instagram) {
      const igText = seller.instagramHandle || "Instagram";
      links.push(`<a href="${p2EscapeHtml(seller.instagram)}" target="_blank" rel="noopener noreferrer">${p2EscapeHtml(igText)}</a>`);
    }
    if (seller.website) {
      links.push(`<a href="${p2EscapeHtml(seller.website)}" target="_blank" rel="noopener noreferrer">Website</a>`);
    }
    if (seller.whatsapp) {
      links.push(`<a href="${p2EscapeHtml(seller.whatsapp)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`);
    }

    return `
      <aside class="sold-by-card" aria-label="Sold by seller details">
        <div class="sold-by-head">
          <div class="sold-by-logo" id="p2SellerLogoWrap">
            ${logoSrc ? `<img src="${p2EscapeHtml(logoSrc)}" alt="${p2EscapeHtml(seller.businessName)} logo">` : `<span>${fallbackEmoji}</span>`}
          </div>
          <div class="sold-by-identity">
            <span class="sold-by-kicker">Sold by</span>
            <h2 class="sold-by-name">${p2EscapeHtml(seller.businessName)}</h2>
            <div class="sold-by-city">📍 ${p2EscapeHtml(seller.city || "Pakistan")}</div>
          </div>
        </div>

        ${seller.bio ? `<p class="sold-by-bio">${p2EscapeHtml(seller.bio)}</p>` : ""}

        ${links.length ? `<div class="sold-by-links">${links.join(" · ")}</div>` : ""}

        <a href="${shopHref}" class="btn-primary sold-by-btn">Visit shop</a>
      </aside>
    `;
  }

  function p2InitProductPage() {
    if (!p2DetailContainer) return;

    const id = new URLSearchParams(window.location.search).get("id");
    const rawProduct = id && typeof getProduct === "function" ? getProduct(id) : null;

    if (!rawProduct) {
      p2RenderMissing();
      return;
    }

    const product =
      window.CatalogDemo && typeof window.CatalogDemo.enrichProduct === "function"
        ? window.CatalogDemo.enrichProduct(rawProduct)
        : rawProduct;

    document.title = `${product.title} | ${SITE.name}`;

    const seller =
      product.seller ||
      (window.CatalogDemo && typeof window.CatalogDemo.getSellerInfo === "function"
        ? window.CatalogDemo.getSellerInfo(product.shopId)
        : {
            businessName: (typeof getShop === "function" && getShop(product.shopId) && getShop(product.shopId).name) || "Maker Shop",
            city: (typeof getShop === "function" && getShop(product.shopId) && getShop(product.shopId).city) || "Pakistan",
            bio: "",
            instagram: "",
            instagramHandle: "",
            website: "",
            whatsapp: "",
            logo: ""
          });

    const emoji = p2GetEmoji(product.category);
    const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    const priceLabel = typeof formatPKR === "function" ? formatPKR(product.price) : `Rs ${product.price}`;
    const inStock = Number(product.stock) > 0;
    const stockBadgeText = inStock ? `In Stock (${product.stock})` : "Out of Stock";

    const colorOptions =
      product.variations && Array.isArray(product.variations.color)
        ? product.variations.color
        : [];
    const sizeOptions =
      product.variations && Array.isArray(product.variations.size)
        ? product.variations.size
        : [];

    const detailsList = Array.isArray(product.details) ? product.details : [];
    const detailsRowsHtml = detailsList.length
      ? detailsList
          .map(
            (item) => `
            <div class="detail-spec-row">
              <span class="detail-spec-label">${p2EscapeHtml(item.label)}</span>
              <span class="detail-spec-value">${p2EscapeHtml(item.value)}</span>
            </div>
          `
          )
          .join("")
      : `<p class="muted-small">No extra specifications listed for this item yet.</p>`;

    const subcatLabel = product.subcategoryName
      ? `<span class="subcat-pill">${p2EscapeHtml(product.subcategoryEmoji || "✨")} ${p2EscapeHtml(product.subcategoryName)}</span>`
      : "";

    p2DetailContainer.innerHTML = `
      <div class="detail-card">
        <div class="gallery-col">
          <div id="p2GalleryStage" class="gallery-stage"></div>
          <div id="p2GalleryThumbs" class="gallery-thumbs"></div>
        </div>

        <div class="detail-info">
          <div class="detail-top-badges">
            <span class="detail-kicker">${emoji} ${p2EscapeHtml(product.category || "Handmade")}</span>
            ${subcatLabel}
          </div>

          <h1>${p2EscapeHtml(product.title)}</h1>
          <div class="detail-price">${priceLabel}</div>

          <div class="detail-meta-strip">
            <span class="badge-stock">${stockBadgeText}</span>
            ${typeof product.readyInDays === "number"
              ? `<span class="ready-tag">⏱ Ready in ${product.readyInDays} ${product.readyInDays === 1 ? "day" : "days"}</span>`
              : ""}
          </div>

          ${product.isBakingItem
            ? `<div class="baking-notice">🍰 Lahore delivery only</div>`
            : ""}

          ${colorOptions.length > 0
            ? `
            <div class="swatch-block">
              <div class="swatch-heading">Color: <strong id="p2ActiveColorLabel">${p2EscapeHtml(colorOptions[0])}</strong></div>
              <div class="swatch-row" id="p2ColorSwatches">
                ${colorOptions.map((c, idx) => `
                  <button type="button" class="swatch-pill ${idx === 0 ? "is-selected" : ""}" data-color="${p2EscapeHtml(c)}">
                    ${p2EscapeHtml(c)}
                  </button>
                `).join("")}
              </div>
            </div>
          `
            : ""}

          <div class="variations-panel">
            ${colorOptions.length > 0
              ? `<div class="variation-group">
                  <label for="p2ColorChoice">Color Option</label>
                  <select id="p2ColorChoice">
                    ${colorOptions.map((c) => `<option value="${p2EscapeHtml(c)}">${p2EscapeHtml(c)}</option>`).join("")}
                  </select>
                </div>`
              : ""}

            ${sizeOptions.length > 0
              ? `<div class="variation-group">
                  <label for="p2SizeChoice">Size</label>
                  <select id="p2SizeChoice">
                    ${sizeOptions.map((s) => `<option value="${p2EscapeHtml(s)}">${p2EscapeHtml(s)}</option>`).join("")}
                  </select>
                </div>`
              : ""}
          </div>

          <div class="custom-notes-box">
            <div class="field-inline">
              <label for="p2CustomColorNote">Want a custom shade or detail?</label>
              <input type="text" id="p2CustomColorNote" placeholder="e.g. pastel pink ribbon or soft lavender">
            </div>
            <div class="field-inline">
              <label for="p2HandwrittenNote">Gift / handwritten card note</label>
              <textarea id="p2HandwrittenNote" rows="2" placeholder="Write it here for a potli gift note"></textarea>
            </div>
          </div>

          <div class="purchase-row">
            <div class="qty-stepper" aria-label="Quantity selector">
              <button type="button" id="p2QtyMinus" aria-label="Decrease quantity">−</button>
              <span id="p2QtyValue">1</span>
              <button type="button" id="p2QtyPlus" aria-label="Increase quantity">+</button>
            </div>

            <button type="button" id="p2AddToCartBtn" class="add-cart-btn" ${!inStock ? "disabled" : ""}>
              ${inStock ? "Add to bag" : "Out of Stock"}
            </button>
          </div>

          <div id="p2CartFeedback" class="cart-status-msg" role="status" aria-live="polite"></div>

          <div class="detail-tabs-wrap">
            <div class="detail-tabs" role="tablist" aria-label="Product information sections">
              <button type="button" class="detail-tab is-active" role="tab" aria-selected="true" data-tab="description">Description</button>
              <button type="button" class="detail-tab" role="tab" aria-selected="false" data-tab="details">Details</button>
              <button type="button" class="detail-tab" role="tab" aria-selected="false" data-tab="delivery">Delivery</button>
              <button type="button" class="detail-tab" role="tab" aria-selected="false" data-tab="seller">Seller</button>
            </div>

            <div class="detail-tab-panels">
              <div class="detail-tab-panel is-active" data-panel="description">
                <div class="info-panel-card">
                  <p class="detail-desc">${p2EscapeHtml(product.description || "Handcrafted small-batch item.")}</p>
                </div>
              </div>

              <div class="detail-tab-panel" data-panel="details">
                <div class="detail-specs-list">
                  ${detailsRowsHtml}
                </div>
              </div>

              <div class="detail-tab-panel" data-panel="delivery">
                ${p2BuildDeliveryPanel(product, seller)}
              </div>

              <div class="detail-tab-panel" data-panel="seller">
                ${p2BuildSellerPanel(product, seller)}
              </div>
            </div>
          </div>

          ${p2BuildSoldByCard(product, seller, emoji)}
        </div>
      </div>
    `;

    // Seller logo fallback
    const logoImg = document.querySelector("#p2SellerLogoWrap img");
    if (logoImg) {
      logoImg.addEventListener("error", () => {
        logoImg.replaceWith(Object.assign(document.createElement("span"), { textContent: emoji }));
      });
    }

    // Gallery stage & thumbnails
    const stage = document.getElementById("p2GalleryStage");
    const thumbs = document.getElementById("p2GalleryThumbs");

    function p2SetSlide(index) {
      if (!stage) return;
      const src = images[index] ? `../${images[index]}` : "";
      if (!src) {
        stage.innerHTML = `<span class="gallery-emoji">${emoji}</span>`;
        return;
      }

      stage.innerHTML = `<img src="${p2EscapeHtml(src)}" alt="${p2EscapeHtml(product.title)}">`;
      const mainImg = stage.querySelector("img");
      if (mainImg) {
        mainImg.addEventListener("error", () => {
          stage.innerHTML = `<span class="gallery-emoji">${emoji}</span>`;
        });
      }

      if (thumbs) {
        thumbs.querySelectorAll(".thumb-btn").forEach((btn, idx) => {
          btn.classList.toggle("active", idx === index);
        });
      }
    }

    if (images.length > 0 && thumbs) {
      images.forEach((rawPath, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `thumb-btn ${idx === 0 ? "active" : ""}`;
        btn.innerHTML = `<img src="../${p2EscapeHtml(rawPath)}" alt="${p2EscapeHtml(product.title)} photo ${idx + 1}">`;
        const imgEl = btn.querySelector("img");
        if (imgEl) {
          imgEl.addEventListener("error", () => {
            imgEl.replaceWith(Object.assign(document.createElement("span"), { textContent: emoji }));
          });
        }
        btn.addEventListener("click", () => p2SetSlide(idx));
        thumbs.appendChild(btn);
      });
      p2SetSlide(0);
    } else {
      p2SetSlide(-1);
    }

    // Sync color swatches with select dropdown
    const colorSelect = document.getElementById("p2ColorChoice");
    const activeColorLabel = document.getElementById("p2ActiveColorLabel");
    const swatchButtons = p2DetailContainer.querySelectorAll(".swatch-pill");

    function p2SyncColorSelection(val) {
      if (colorSelect) colorSelect.value = val;
      if (activeColorLabel) activeColorLabel.textContent = val;
      swatchButtons.forEach((btn) => {
        btn.classList.toggle("is-selected", btn.getAttribute("data-color") === val);
      });
    }

    swatchButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        p2SyncColorSelection(btn.getAttribute("data-color") || "");
      });
    });

    if (colorSelect) {
      colorSelect.addEventListener("change", () => {
        p2SyncColorSelection(colorSelect.value);
      });
    }

    // Tabs switching
    const tabButtons = p2DetailContainer.querySelectorAll(".detail-tab");
    const tabPanels = p2DetailContainer.querySelectorAll(".detail-tab-panel");

    tabButtons.forEach((tabBtn) => {
      tabBtn.addEventListener("click", () => {
        const target = tabBtn.getAttribute("data-tab");
        tabButtons.forEach((b) => {
          const active = b === tabBtn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-selected", active ? "true" : "false");
        });
        tabPanels.forEach((panel) => {
          panel.classList.toggle("is-active", panel.getAttribute("data-panel") === target);
        });
      });
    });

    // Quantity stepper
    let qty = 1;
    const maxQty = Math.max(1, Number(product.stock) || 1);
    const qtyValueEl = document.getElementById("p2QtyValue");
    const minusBtn = document.getElementById("p2QtyMinus");
    const plusBtn = document.getElementById("p2QtyPlus");

    function p2UpdateQtyDisplay() {
      if (qtyValueEl) qtyValueEl.textContent = String(qty);
    }

    if (minusBtn) {
      minusBtn.addEventListener("click", () => {
        if (qty > 1) {
          qty -= 1;
          p2UpdateQtyDisplay();
        }
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener("click", () => {
        if (qty < maxQty) {
          qty += 1;
          p2UpdateQtyDisplay();
        }
      });
    }

    // Add to cart (preserves existing cart item shape)
    const addBtn = document.getElementById("p2AddToCartBtn");
    const feedback = document.getElementById("p2CartFeedback");

    if (addBtn && inStock) {
      addBtn.addEventListener("click", () => {
        const variation = {};
        if (colorOptions.length > 0 && colorSelect) {
          variation.color = colorSelect.value;
        }
        if (sizeOptions.length > 0) {
          const sizeSelect = document.getElementById("p2SizeChoice");
          if (sizeSelect) variation.size = sizeSelect.value;
        }

        const cart = typeof getCart === "function" ? getCart() : [];
        const found = cart.find(
          (c) => c.productId === id && JSON.stringify(c.variation) === JSON.stringify(variation)
        );
        if (found) {
          found.qty += qty;
        } else {
          cart.push({ productId: id, qty, variation, shopId: rawProduct.shopId });
        }

        if (typeof saveCart === "function") {
          saveCart(cart);
        }
        if (typeof renderNavbar === "function") {
          renderNavbar();
        }
        if (feedback) {
          feedback.textContent = `Added ${qty} to bag!`;
        }
      });
    }
  }

  p2InitProductPage();
})();