/* js/catalog.js — Demo Subcategories, Category Detail Templates, Seller Info & Helpers
   Later:
   - Admin Dashboard can create/update categories, subcategories & images
   - Seller Dashboard can use CATEGORY_DETAIL_TEMPLATES to enter category-specific product details
     and update shop/seller business info
*/
(function (global) {
  // 1. Subcategories per category (demo images in images/subcategories/ + emoji fallback)
  const SUBCATEGORIES_BY_CATEGORY = {
    Crochet: [
      { id: "flowers", name: "Flowers", image: "images/subcategories/crochet-flowers.jpg", emoji: "🌷" },
      { id: "bags", name: "Bags", image: "images/subcategories/crochet-bags.jpg", emoji: "👜" },
      { id: "toys", name: "Toys", image: "images/subcategories/crochet-toys.jpg", emoji: "🧸" },
      { id: "wearables", name: "Wearables", image: "images/subcategories/crochet-wearables.jpg", emoji: "🧣" },
      { id: "keychains", name: "Keychains", image: "images/subcategories/crochet-keychains.jpg", emoji: "🔑" }
    ],
    "Scented Candles": [
      { id: "jar-candles", name: "Jar Candles", image: "images/subcategories/candles-jars.jpg", emoji: "🕯️" },
      { id: "dessert-candles", name: "Dessert & Pillar", image: "images/subcategories/candles-dessert.jpg", emoji: "🧁" }
    ],
    Cakes: [
      { id: "birthday", name: "Birthday", image: "images/subcategories/cakes-birthday.jpg", emoji: "🎂" },
      { id: "cupcakes", name: "Cupcakes", image: "images/subcategories/cakes-cupcakes.jpg", emoji: "🧁" },
      { id: "custom", name: "Custom", image: "images/subcategories/cakes-custom.jpg", emoji: "🎀" }
    ],
    Paintings: [
      { id: "mini-canvas", name: "Mini Canvases", image: "images/subcategories/paintings-mini.jpg", emoji: "🎨" },
      { id: "botanical", name: "Botanical & Sets", image: "images/subcategories/paintings-botanical.jpg", emoji: "🌿" }
    ],
    "Pipe Cleaners": [
      { id: "pipe-bouquets", name: "Flower Bouquets", image: "images/subcategories/pipecleaners-bouquets.jpg", emoji: "🌸" },
      { id: "pipe-charms", name: "Charms & Miniatures", image: "images/subcategories/pipecleaners-charms.jpg", emoji: "✨" }
    ],
    "Gift Baskets": [
      { id: "birthday-baskets", name: "Birthday Hampers", image: "images/subcategories/baskets-birthday.jpg", emoji: "🎁" },
      { id: "cozy-baskets", name: "Cozy Care Potlis", image: "images/subcategories/baskets-cozy.jpg", emoji: "🧺" }
    ]
  };

  // Common fields every product supports
  const COMMON_DETAIL_FIELDS = [
    "Material",
    "Size / Dimensions",
    "Weight",
    "Care Instructions",
    "Customization Available",
    "Ready-In Days",
    "Gift Wrap & Packaging"
  ];

  // Category detail templates (framework for Seller Dashboard forms + Product Details display)
  const CATEGORY_DETAIL_TEMPLATES = {
    Crochet: {
      common: COMMON_DETAIL_FIELDS,
      extra: ["Yarn Type", "Washable", "Color Options"]
    },
    "Scented Candles": {
      common: COMMON_DETAIL_FIELDS,
      extra: ["Wax Type", "Scent Notes", "Burn Time", "Weight"]
    },
    Cakes: {
      common: COMMON_DETAIL_FIELDS,
      extra: ["Flavor", "Serves How Many", "Ingredients", "Allergens", "Shelf Life", "Advance Notice", "Lahore Only"]
    },
    Paintings: {
      common: COMMON_DETAIL_FIELDS,
      extra: ["Medium", "Surface", "Framed or Not", "Signed"]
    },
    "Pipe Cleaners": {
      common: COMMON_DETAIL_FIELDS,
      extra: ["Length / Size", "Number of Pieces"]
    },
    "Gift Baskets": {
      common: COMMON_DETAIL_FIELDS,
      extra: ["What's Inside", "Occasion"]
    }
  };

  // Demo Seller Business Info (keyed by shopId)
  const DEMO_SELLER_INFO = {
    "shop-1": {
      businessName: "Potli & Bloom Studio",
      logo: "images/Crochet.jpeg",
      bio: "Small-batch crochet blooms, keychains, and handmade potli keepsakes crafted with care.",
      city: "Lahore",
      instagram: "https://instagram.com/potliandbloom.pk",
      instagramHandle: "@potliandbloom.pk",
      website: "https://potliandbloom.example.com",
      whatsapp: "https://wa.me/923000000001"
    },
    "shop-2": {
      businessName: "Amber & Wick Co.",
      logo: "images/Candles.jpg",
      bio: "Hand-poured scented candles blended for warm evenings and thoughtful gifting.",
      city: "Islamabad",
      instagram: "https://instagram.com/amberandwick.pk",
      instagramHandle: "@amberandwick.pk",
      website: "",
      whatsapp: "https://wa.me/923000000002"
    },
    "shop-3": {
      businessName: "Crumb & Ribbon Bakehouse",
      logo: "images/cake.jpg",
      bio: "Freshly baked cakes and cupcakes in Lahore with custom ribbons and notes.",
      city: "Lahore",
      instagram: "https://instagram.com/crumbandribbon.lhr",
      instagramHandle: "@crumbandribbon.lhr",
      website: "https://crumbandribbon.example.com",
      whatsapp: "https://wa.me/923000000003"
    },
    "shop-4": {
      businessName: "Gulabi Canvas Studio",
      logo: "images/paintings.jpg",
      bio: "Original mini paintings and botanical art sets made for cozy corners.",
      city: "Karachi",
      instagram: "https://instagram.com/gulabicanvas",
      instagramHandle: "@gulabicanvas",
      website: "",
      whatsapp: ""
    }
  };

  // Demo product enrichment (subcategory + label/value details list)
  const DEMO_PRODUCT_OVERRIDES = {
    defaultByCategory: {
      Crochet: {
        subcategory: "flowers",
        details: [
          { label: "Material", value: "Soft milk cotton yarn" },
          { label: "Size / Dimensions", value: "Approx. 12 in height" },
          { label: "Weight", value: "140 g" },
          { label: "Yarn Type", value: "Milk cotton & plush blend" },
          { label: "Washable", value: "Gentle hand wash in cold water" },
          { label: "Color Options", value: "Cherry, Blush Pink, Sunflower Yellow, Lavender" },
          { label: "Customization Available", value: "Yes — custom colors & handwritten note" },
          { label: "Ready-In Days", value: "5–7 days" },
          { label: "Gift Wrap & Packaging", value: "Kraft wrap & stitched ribbon included" },
          { label: "Care Instructions", value: "Keep dry and reshape gently after washing" }
        ]
      },
      "Scented Candles": {
        subcategory: "jar-candles",
        details: [
          { label: "Material", value: "Glass jar & cotton wick" },
          { label: "Size / Dimensions", value: "8 cm x 9 cm" },
          { label: "Wax Type", value: "Natural soy wax blend" },
          { label: "Scent Notes", value: "Warm vanilla, sweet amber & soft rose" },
          { label: "Burn Time", value: "Approx. 35 hours" },
          { label: "Weight", value: "180 g" },
          { label: "Customization Available", value: "Custom gift tag available" },
          { label: "Ready-In Days", value: "2–3 days" },
          { label: "Gift Wrap & Packaging", value: "Padded potli box included" },
          { label: "Care Instructions", value: "Trim wick to 0.5 cm before each burn" }
        ]
      },
      Cakes: {
        subcategory: "birthday",
        details: [
          { label: "Flavor", value: "Classic Vanilla Bean & Strawberry" },
          { label: "Serves How Many", value: "6–8 people" },
          { label: "Ingredients", value: "Flour, butter, eggs, sugar, cream, vanilla" },
          { label: "Allergens", value: "Gluten, dairy, eggs" },
          { label: "Shelf Life", value: "3 days refrigerated" },
          { label: "Advance Notice", value: "24–48 hours advance order required" },
          { label: "Lahore Only", value: "Yes — Lahore local delivery only" },
          { label: "Customization Available", value: "Custom inscription & bow color" },
          { label: "Gift Wrap & Packaging", value: "Cake box with satin ribbon" },
          { label: "Care Instructions", value: "Keep chilled until 20 minutes before serving" }
        ]
      },
      Paintings: {
        subcategory: "mini-canvas",
        details: [
          { label: "Medium", value: "Acrylic paint" },
          { label: "Surface", value: "Stretched cotton mini canvas" },
          { label: "Size / Dimensions", value: "4 in x 4 in" },
          { label: "Weight", value: "65 g" },
          { label: "Framed or Not", value: "Unframed (mini wooden easel optional)" },
          { label: "Signed", value: "Yes — signed on back by artist" },
          { label: "Customization Available", value: "Custom palette request available" },
          { label: "Ready-In Days", value: "3–5 days" },
          { label: "Gift Wrap & Packaging", value: "Protective bubble & blush wrap" },
          { label: "Care Instructions", value: "Wipe gently with a dry soft cloth; avoid direct sun" }
        ]
      }
    }
  };

  function getSubcategoriesForCategory(category) {
    if (SUBCATEGORIES_BY_CATEGORY[category]) {
      return SUBCATEGORIES_BY_CATEGORY[category];
    }
    const slug = String(category || "item").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return [
      { id: `${slug}-main`, name: `${category || "General"} Classics`, image: "", emoji: "✨" }
    ];
  }

  function getSubcategoryMeta(category, subId) {
    const list = getSubcategoriesForCategory(category);
    return list.find((item) => item.id === subId || item.name.toLowerCase() === String(subId || "").toLowerCase()) || null;
  }

  function getSellerInfo(shopId) {
    const baseShop = typeof getShop === "function" ? getShop(shopId) : null;
    const demo = DEMO_SELLER_INFO[shopId] || {};
    return {
      id: shopId,
      businessName: (baseShop && baseShop.name) || demo.businessName || "Maker Studio",
      logo: (baseShop && baseShop.logo) || demo.logo || "",
      bio: (baseShop && baseShop.about) || demo.bio || "Handmade in Pakistan.",
      city: (baseShop && baseShop.city) || demo.city || "Pakistan",
      instagram: (baseShop && baseShop.instagram) || demo.instagram || "",
      instagramHandle: (baseShop && baseShop.instagramHandle) || demo.instagramHandle || "",
      website: (baseShop && baseShop.website) || demo.website || "",
      whatsapp: (baseShop && baseShop.whatsapp) || demo.whatsapp || ""
    };
  }

  function enrichProduct(product) {
    if (!product) return null;
    const cat = product.category || "Crochet";
    const fallback = DEMO_PRODUCT_OVERRIDES.defaultByCategory[cat] || {
      subcategory: getSubcategoriesForCategory(cat)[0].id,
      details: [
        { label: "Material", value: "Handcrafted small-batch material" },
        { label: "Customization Available", value: "Yes" },
        { label: "Ready-In Days", value: "3–5 days" },
        { label: "Gift Wrap & Packaging", value: "Included" }
      ]
    };

    const subcategoryId = product.subcategory || fallback.subcategory;
    const subMeta = getSubcategoryMeta(cat, subcategoryId);
    const details = Array.isArray(product.details) && product.details.length
      ? product.details
      : fallback.details;

    return {
      ...product,
      subcategory: subcategoryId,
      subcategoryName: subMeta ? subMeta.name : subcategoryId,
      subcategoryEmoji: subMeta ? subMeta.emoji : "✨",
      details,
      seller: getSellerInfo(product.shopId)
    };
  }

  // Derive Shop -> Category -> Subcategory -> Products from existing products & shops
  function buildShopCatalogGroups(shopId) {
    const allProds = (typeof getProducts === "function" ? getProducts() : [])
      .map(enrichProduct)
      .filter((p) => p && p.shopId === shopId);

    const byCategory = new Map();
    allProds.forEach((prod) => {
      const cat = prod.category || "Other";
      if (!byCategory.has(cat)) {
        byCategory.set(cat, new Map());
      }
      const subMap = byCategory.get(cat);
      const subKey = prod.subcategory || "general";
      if (!subMap.has(subKey)) {
        subMap.set(subKey, {
          id: subKey,
          name: prod.subcategoryName || subKey,
          products: []
        });
      }
      subMap.get(subKey).products.push(prod);
    });

    return Array.from(byCategory.entries()).map(([category, subMap]) => ({
      category,
      subcategories: Array.from(subMap.values())
    }));
  }

  global.CatalogDemo = {
    SUBCATEGORIES_BY_CATEGORY,
    COMMON_DETAIL_FIELDS,
    CATEGORY_DETAIL_TEMPLATES,
    DEMO_SELLER_INFO,
    getSubcategoriesForCategory,
    getSubcategoryMeta,
    getSellerInfo,
    enrichProduct,
    buildShopCatalogGroups
  };
})(window);