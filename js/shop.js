document.title = document.title.replace(/_+SITE_+/, SITE.name);
(function () {
  const headerContainer = document.getElementById("shopHeaderContainer");
  const sectionsContainer = document.getElementById("shopCatalogSections");

  function getEmoji(category) {
    if (typeof CATEGORY_EMOJI !== "undefined" && CATEGORY_EMOJI[category]) {
      return CATEGORY_EMOJI[category];
    }
    return "✨";
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderMissingShop() {
    if (headerContainer) {
      headerContainer.innerHTML = `
        <div class="shop-empty-box">
          <h2>Shop not found</h2>
          <p>We couldn't find this maker shop or the link is missing an ID.</p>
          <a href="products.html" class="btn-primary">Browse All Products</a>
        </div>
      `;
    }
    if (sectionsContainer) sectionsContainer.innerHTML = "";
  }

  function renderShopPage() {
    if (!headerContainer || !sectionsContainer) return;

    const params = new URLSearchParams(window.location.search);
    const shopId = params.get("id");
    const allShops = typeof getShops === "function" ? getShops() : [];
    const shop =
      (shopId && typeof getShop === "function" && getShop(shopId)) ||
      allShops[0] ||
      null;

    if (!shop) {
      renderMissingShop();
      return;
    }

    const activeShopId = shop.id;
    const seller =
      window.CatalogDemo && typeof window.CatalogDemo.getSellerInfo === "function"
        ? window.CatalogDemo.getSellerInfo(activeShopId)
        : {
            businessName: shop.name,
            bio: shop.about || "",
            city: shop.city || "Pakistan",
            logo: shop.logo || "",
            instagram: shop.instagram || "",
            instagramHandle: shop.instagramHandle || "",
            website: shop.website || "",
            whatsapp: shop.whatsapp || ""
          };

    document.title = `${seller.businessName} | ${SITE.name}`;

    const links = [];
    if (seller.instagram) {
      links.push(
        `<a href="${escapeHtml(seller.instagram)}" target="_blank" rel="noopener noreferrer" class="shop-social-pill">${escapeHtml(seller.instagramHandle || "Instagram")}</a>`
      );
    }
    if (seller.website) {
      links.push(
        `<a href="${escapeHtml(seller.website)}" target="_blank" rel="noopener noreferrer" class="shop-social-pill">Website</a>`
      );
    }
    if (seller.whatsapp) {
      links.push(
        `<a href="${escapeHtml(seller.whatsapp)}" target="_blank" rel="noopener noreferrer" class="shop-social-pill">WhatsApp</a>`
      );
    }

    const logoSrc = seller.logo ? `../${seller.logo}` : "";

    headerContainer.innerHTML = `
      <section class="shop-hero-card">
        <div class="shop-avatar-wrap" id="shopAvatarWrap">
          ${logoSrc ? `<img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(seller.businessName)}">` : `<span>🛍️</span>`}
        </div>
        <div class="shop-hero-body">
          <span class="shop-kicker">Maker Shopfront</span>
          <h1>${escapeHtml(seller.businessName)}</h1>
          <div class="shop-city-tag">📍 ${escapeHtml(seller.city || "Pakistan")}</div>
          ${seller.bio ? `<p class="shop-bio">${escapeHtml(seller.bio)}</p>` : ""}
          ${links.length ? `<div class="shop-links-row">${links.join("")}</div>` : ""}
        </div>
      </section>
    `;

    const avatarImg = headerContainer.querySelector("#shopAvatarWrap img");
    if (avatarImg) {
      avatarImg.addEventListener("error", () => {
        avatarImg.replaceWith(Object.assign(document.createElement("span"), { textContent: "🛍️" }));
      });
    }

    const groups =
      window.CatalogDemo && typeof window.CatalogDemo.buildShopCatalogGroups === "function"
        ? window.CatalogDemo.buildShopCatalogGroups(activeShopId)
        : [];

    sectionsContainer.innerHTML = "";

    if (!groups.length) {
      sectionsContainer.innerHTML = `
        <div class="shop-empty-box">
          <p>No products listed for this shop yet.</p>
          <a href="products.html" class="btn-primary">Explore All Products</a>
        </div>
      `;
      return;
    }

    groups.forEach((group, groupIdx) => {
      const emoji = getEmoji(group.category);
      const section = document.createElement("section");
      section.className = "shop-category-section";

      const chipsHtml = [
        `<button type="button" class="shop-subchip is-active" data-sub="all">All ${escapeHtml(group.category)}</button>`,
        ...group.subcategories.map(
          (sub) =>
            `<button type="button" class="shop-subchip" data-sub="${escapeHtml(sub.id)}">${escapeHtml(sub.name)}</button>`
        )
      ].join("");

      const subBlocksHtml = group.subcategories
        .map((sub) => {
          const cardsHtml = sub.products
            .map((prod) => {
              const imgPath = Array.isArray(prod.images) && prod.images[0] ? `../${prod.images[0]}` : "";
              const priceText =
                typeof formatPKR === "function" ? formatPKR(prod.price) : `Rs ${prod.price}`;
              return `
                <article class="product-card">
                  <a href="product.html?id=${encodeURIComponent(prod.id)}" class="shop-prod-link">
                    <div class="shop-prod-thumb">
                      ${imgPath ? `<img src="${escapeHtml(imgPath)}" alt="${escapeHtml(prod.title)}">` : `<span>${emoji}</span>`}
                    </div>
                    <h3>${escapeHtml(prod.title)}</h3>
                    <div class="shop-prod-sub">Subcategory: ${escapeHtml(sub.name)}</div>
                    <div class="shop-prod-price">${escapeHtml(priceText)}</div>
                  </a>
                  <a href="product.html?id=${encodeURIComponent(prod.id)}" class="btn-primary shop-view-btn">View Details</a>
                </article>
              `;
            })
            .join("");

          return `
            <div class="shop-subcat-block" data-sub-block="${escapeHtml(sub.id)}">
              <h3 class="shop-subcat-heading">${escapeHtml(sub.name)}</h3>
              <div class="shop-products-grid">${cardsHtml}</div>
            </div>
          `;
        })
        .join("");

      section.innerHTML = `
        <div class="shop-cat-header">
          <h2>${emoji} ${escapeHtml(group.category)}</h2>
        </div>
        <div class="shop-subchips-row" role="group" aria-label="${escapeHtml(group.category)} subcategories" data-cat-chips="${groupIdx}">
          ${chipsHtml}
        </div>
        <div class="shop-subcat-blocks">${subBlocksHtml}</div>
      `;

      section.querySelectorAll(".shop-subchip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const selectedSub = chip.getAttribute("data-sub");
          section.querySelectorAll(".shop-subchip").forEach((c) => {
            c.classList.toggle("is-active", c === chip);
          });
          section.querySelectorAll("[data-sub-block]").forEach((block) => {
            const blockSub = block.getAttribute("data-sub-block");
            block.hidden = selectedSub !== "all" && blockSub !== selectedSub;
          });
        });
      });

      section.querySelectorAll(".shop-prod-thumb img").forEach((imgEl) => {
        imgEl.addEventListener("error", () => {
          imgEl.replaceWith(Object.assign(document.createElement("span"), { textContent: emoji }));
        });
      });

      sectionsContainer.appendChild(section);
    });
  }

  renderShopPage();
})();