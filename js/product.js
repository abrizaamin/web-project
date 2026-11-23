document.title = document.title.replace(/_+SITE_+/, SITE.name);
(function () {
  const p2DetailContainer = document.getElementById("productDetailContainer");

  function p2GetEmoji(category) {
    if (typeof CATEGORY_EMOJI !== "undefined" && CATEGORY_EMOJI && CATEGORY_EMOJI[category]) {
      return CATEGORY_EMOJI[category];
    }
    return "✨";
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

  function p2InitProductPage() {
    if (!p2DetailContainer) return;

    const id = new URLSearchParams(window.location.search).get("id");
    const product = id && typeof getProduct === "function" ? getProduct(id) : null;

    if (!product) {
      p2RenderMissing();
      return;
    }

    document.title = `${product.title} | ${SITE.name}`;

    const shop = typeof getShop === "function" ? getShop(product.shopId) : null;
    const emoji = p2GetEmoji(product.category);
    const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    const priceLabel = typeof formatPKR === "function" ? formatPKR(product.price) : `Rs ${product.price}`;
    const inStock = Number(product.stock) > 0;
    const stockBadgeText = inStock ? `In Stock (${product.stock})` : "Out of Stock";

    const colorOptions = product.variations && Array.isArray(product.variations.color)
      ? product.variations.color
      : [];
    const sizeOptions = product.variations && Array.isArray(product.variations.size)
      ? product.variations.size
      : [];

    p2DetailContainer.innerHTML = `
      <div class="detail-card">
        <div class="gallery-col">
          <div id="p2GalleryStage" class="gallery-stage"></div>
          <div id="p2GalleryThumbs" class="gallery-thumbs"></div>
        </div>

        <div class="detail-info">
          <span class="detail-kicker">${emoji} ${product.category || "Handmade"}</span>
          <h1>${product.title}</h1>
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

          <p class="detail-desc">${product.description || ""}</p>

          ${shop
            ? `<div class="maker-callout">
                Made by <a href="shop.html?id=${encodeURIComponent(shop.id)}">${shop.name}</a> · 📍 ${shop.city || "Pakistan"}
              </div>`
            : ""}

          <div class="variations-panel">
            ${colorOptions.length > 0
              ? `<div class="variation-group">
                  <label for="p2ColorChoice">Color</label>
                  <select id="p2ColorChoice">
                    ${colorOptions.map((c) => `<option value="${c}">${c}</option>`).join("")}
                  </select>
                </div>`
              : ""}

            ${sizeOptions.length > 0
              ? `<div class="variation-group">
                  <label for="p2SizeChoice">Size</label>
                  <select id="p2SizeChoice">
                    ${sizeOptions.map((s) => `<option value="${s}">${s}</option>`).join("")}
                  </select>
                </div>`
              : ""}
          </div>

          <button type="button" id="p2AddToCartBtn" class="add-cart-btn" ${!inStock ? "disabled" : ""}>
            ${inStock ? "Add to Cart" : "Out of Stock"}
          </button>

          <div id="p2CartFeedback" class="cart-status-msg" role="status" aria-live="polite"></div>
        </div>
      </div>
    `;

    const stage = document.getElementById("p2GalleryStage");
    const thumbs = document.getElementById("p2GalleryThumbs");

    function p2SetSlide(index) {
      if (!stage) return;
      const src = images[index] ? `../${images[index]}` : "";
      if (!src) {
        stage.innerHTML = `<span class="gallery-emoji">${emoji}</span>`;
        return;
      }

      stage.innerHTML = `<img src="${src}" alt="${product.title}">`;
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
        btn.innerHTML = `<img src="../${rawPath}" alt="${product.title} photo ${idx + 1}">`;
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

    const addBtn = document.getElementById("p2AddToCartBtn");
    const feedback = document.getElementById("p2CartFeedback");

    if (addBtn && inStock) {
      addBtn.addEventListener("click", () => {
        const variation = {};
        if (colorOptions.length > 0) {
          const colorSelect = document.getElementById("p2ColorChoice");
          if (colorSelect) variation.color = colorSelect.value;
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
          found.qty += 1;
        } else {
          cart.push({ productId: id, qty: 1, variation, shopId: product.shopId });
        }

        if (typeof saveCart === "function") {
          saveCart(cart);
        }
        if (typeof renderNavbar === "function") {
          renderNavbar();
        }
        if (feedback) {
          feedback.textContent = "Added to cart!";
        }
      });
    }
  }

  p2InitProductPage();
})();