/* data.js - mock database (Member 1). Shape database jaisi rakhi hai, Phase 2 mein asani hogi. */

const CITIES = ["Lahore", "Karachi", "Islamabad", "Faisalabad", "Multan"];
const CATEGORIES = ["crochet", "candles", "cakes", "paintings", "pipe-cleaners", "gift-baskets"];
const CATEGORY_EMOJI = { crochet: "🧶", candles: "🕯️", cakes: "🎂", paintings: "🎨", "pipe-cleaners": "🌸", "gift-baskets": "🧺" };

const SHOPS = [
  { id: "s1", name: "Crochet Corner", city: "Lahore", logo: "images/shops/s1.jpg", banner: "images/shops/s1-banner.jpg",
    about: "Handmade crochet flowers, keychains and bags.", deliveryCities: { Lahore: 150, Karachi: 300, Islamabad: 250, Multan: 280 } },
  { id: "s2", name: "Sweet Oven", city: "Lahore", logo: "images/shops/s2.jpg", banner: "images/shops/s2-banner.jpg",
    about: "Custom cakes, cupcakes and brownies baked fresh.", deliveryCities: { Lahore: 200 } },
  { id: "s3", name: "Glow & Wick", city: "Lahore", logo: "images/shops/s3.jpg", banner: "images/shops/s3-banner.jpg",
    about: "Scented soy candles poured in small batches.", deliveryCities: { Lahore: 150, Karachi: 280, Islamabad: 250, Faisalabad: 220 } },
  { id: "s4", name: "Rang Studio", city: "Islamabad", logo: "images/shops/s4.jpg", banner: "images/shops/s4-banner.jpg",
    about: "Original paintings and mini canvases.", deliveryCities: { Islamabad: 150, Lahore: 250, Karachi: 350 } },
  { id: "s5", name: "Fuzzy Friends", city: "Karachi", logo: "images/shops/s5.jpg", banner: "images/shops/s5-banner.jpg",
    about: "Pipe cleaner flowers, bouquets and cute figures.", deliveryCities: { Karachi: 150, Lahore: 280, Islamabad: 300 } },
  { id: "s6", name: "Potli Baskets", city: "Lahore", logo: "images/shops/s6.jpg", banner: "images/shops/s6-banner.jpg",
    about: "Ready-made gift baskets for every occasion.", deliveryCities: { Lahore: 180, Karachi: 320, Islamabad: 260, Faisalabad: 240, Multan: 260 } }
];

// tags AI planner (Phase 1 ka fake matching) aur search dono ke kaam aate hain
const PRODUCTS = [
  { id: "p1", shopId: "s1", title: "Crochet Sunflower Bouquet", category: "crochet", price: 1200, stock: 8,
    images: ["images/products/p1.jpg"], description: "Handmade sunflowers that never wilt.",
    variations: { color: ["Yellow", "Pink"], size: ["Small", "Large"] }, readyInDays: 3, isBakingItem: false, tags: ["flowers", "yellow", "cute", "home", "decor"] },
  { id: "p2", shopId: "s1", title: "Crochet Tote Bag", category: "crochet", price: 2200, stock: 5,
    images: ["images/products/p2.jpg"], description: "Soft cotton tote, strong and stylish.",
    variations: { color: ["Cream", "Pink", "Green"], size: [] }, readyInDays: 5, isBakingItem: false, tags: ["bag", "aesthetic", "fashion", "pink"] },
  { id: "p3", shopId: "s1", title: "Crochet Bear Keychain", category: "crochet", price: 450, stock: 20,
    images: ["images/products/p3.jpg"], description: "Tiny bear keychain with a cute face.",
    variations: { color: ["Brown", "Pink"], size: [] }, readyInDays: 2, isBakingItem: false, tags: ["cute", "keychain", "small", "teddy", "friend"] },
  { id: "p4", shopId: "s2", title: "Chocolate Truffle Cake", category: "cakes", price: 2500, stock: 5,
    images: ["images/products/p4.jpg"], description: "Rich chocolate cake with ganache.",
    variations: { color: [], size: ["1 lb", "2 lb"] }, readyInDays: 1, isBakingItem: true, tags: ["chocolate", "birthday", "sweet", "party"] },
  { id: "p5", shopId: "s2", title: "Vanilla Cupcakes (box of 6)", category: "cakes", price: 1400, stock: 12,
    images: ["images/products/p5.jpg"], description: "Fluffy vanilla cupcakes with pink frosting.",
    variations: { color: [], size: ["Box of 6", "Box of 12"] }, readyInDays: 1, isBakingItem: true, tags: ["vanilla", "pink", "sweet", "cute", "birthday"] },
  { id: "p6", shopId: "s2", title: "Walnut Brownie Box", category: "cakes", price: 1100, stock: 10,
    images: ["images/products/p6.jpg"], description: "Fudgy brownies with crunchy walnuts.",
    variations: { color: [], size: ["Box of 6"] }, readyInDays: 1, isBakingItem: true, tags: ["chocolate", "brownie", "sweet", "thank"] },
  { id: "p7", shopId: "s3", title: "Vanilla Bloom Soy Candle", category: "candles", price: 950, stock: 15,
    images: ["images/products/p7.jpg"], description: "Warm vanilla scent, 40 hour burn time.",
    variations: { color: ["White", "Pink"], size: ["Small", "Large"] }, readyInDays: 2, isBakingItem: false, tags: ["vanilla", "scented", "relax", "cozy", "home"] },
  { id: "p8", shopId: "s3", title: "Rose Petal Candle Jar", category: "candles", price: 1300, stock: 9,
    images: ["images/products/p8.jpg"], description: "Rose scented candle with dried petals.",
    variations: { color: ["Pink"], size: ["Medium"] }, readyInDays: 3, isBakingItem: false, tags: ["rose", "pink", "romantic", "anniversary", "scented"] },
  { id: "p9", shopId: "s3", title: "Matcha Mint Mini Candle", category: "candles", price: 600, stock: 18,
    images: ["images/products/p9.jpg"], description: "Fresh matcha and mint, travel size.",
    variations: { color: ["Green"], size: ["Mini"] }, readyInDays: 2, isBakingItem: false, tags: ["matcha", "green", "fresh", "small", "scented"] },
  { id: "p10", shopId: "s4", title: "Sunset Mini Canvas Painting", category: "paintings", price: 3000, stock: 4,
    images: ["images/products/p10.jpg"], description: "Hand painted acrylic sunset, 8x10 inch.",
    variations: { color: [], size: ["8x10", "12x16"] }, readyInDays: 7, isBakingItem: false, tags: ["art", "decor", "aesthetic", "home", "sunset"] },
  { id: "p11", shopId: "s4", title: "Floral Watercolor Print", category: "paintings", price: 1800, stock: 7,
    images: ["images/products/p11.jpg"], description: "Soft watercolor flowers on thick paper.",
    variations: { color: [], size: ["A5", "A4"] }, readyInDays: 4, isBakingItem: false, tags: ["flowers", "art", "pink", "decor", "mother"] },
  { id: "p12", shopId: "s5", title: "Pipe Cleaner Rose Bouquet", category: "pipe-cleaners", price: 1500, stock: 10,
    images: ["images/products/p12.jpg"], description: "Bouquet of 6 pipe cleaner roses.",
    variations: { color: ["Red", "Pink", "Mixed"], size: [] }, readyInDays: 3, isBakingItem: false, tags: ["flowers", "rose", "romantic", "pink", "anniversary"] },
  { id: "p13", shopId: "s5", title: "Pipe Cleaner Daisy Pen", category: "pipe-cleaners", price: 350, stock: 25,
    images: ["images/products/p13.jpg"], description: "Pen with a fluffy daisy on top.",
    variations: { color: ["White", "Yellow"], size: [] }, readyInDays: 2, isBakingItem: false, tags: ["cute", "stationery", "small", "friend", "colleague"] },
  { id: "p14", shopId: "s5", title: "Pipe Cleaner Bunny", category: "pipe-cleaners", price: 500, stock: 14,
    images: ["images/products/p14.jpg"], description: "Soft little bunny figure.",
    variations: { color: ["White", "Pink"], size: [] }, readyInDays: 2, isBakingItem: false, tags: ["cute", "small", "kids", "sister", "friend"] },
  { id: "p15", shopId: "s6", title: "Cozy Night Gift Basket", category: "gift-baskets", price: 3500, stock: 6,
    images: ["images/products/p15.jpg"], description: "Candle, tea, chocolates and a soft scrunchie.",
    variations: { color: [], size: [] }, readyInDays: 3, isBakingItem: false, tags: ["cozy", "relax", "chocolate", "mother", "thank", "birthday"] },
  { id: "p16", shopId: "s6", title: "Eid Mubarak Treat Basket", category: "gift-baskets", price: 2800, stock: 8,
    images: ["images/products/p16.jpg"], description: "Dates, sweets and a handmade card.",
    variations: { color: [], size: [] }, readyInDays: 2, isBakingItem: false, tags: ["eid", "festive", "sweet", "family", "mother"] }
];

const USERS = [
  { id: "u1", name: "Test Buyer", email: "buyer@test.com", password: "1234", role: "buyer", addresses: [] },
  { id: "u2", name: "Test Seller", email: "seller@test.com", password: "1234", role: "seller", shopId: "s1", addresses: [] }
];

const ORDERS = [];

/* Shared helpers (sab members use kar sakte hain) */
function getProduct(id) { return PRODUCTS.find(p => p.id === id); }
function getShop(id) { return SHOPS.find(s => s.id === id); }
function formatPKR(n) { return "Rs " + Number(n).toLocaleString("en-PK"); }