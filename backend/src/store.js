const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "store.json");

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  throw error;
}

function readStore() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

function writeStore(store) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function listProducts(category) {
  const store = readStore();

  if (!category) {
    return store.products;
  }

  return store.products.filter((product) => product.category === category.toLowerCase());
}

function getProduct(idOrSlug) {
  const store = readStore();
  return store.products.find((product) => product.id === idOrSlug || product.slug === idOrSlug);
}

function addProduct(payload) {
  const store = readStore();
  const title = String(payload.title || "Untitled Product");
  if (title.trim().length < 3) {
    badRequest("Product title kam az kam 3 letters ka hona chahiye.");
  }

  const product = {
    id: createId("p"),
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    category: String(payload.category || "general").toLowerCase(),
    price: Number(String(payload.price || "0").replace(/[^\d.]/g, "")) || 0,
    sellerId: payload.sellerId || "u_1",
    stock: Number(payload.stock || 0),
    description: String(payload.description || ""),
    status: payload.status || "pending_review",
    createdAt: new Date().toISOString()
  };

  store.products.push(product);
  writeStore(store);
  return product;
}

function approveProduct(productId) {
  const store = readStore();
  const product = store.products.find((item) => item.id === productId);

  if (!product) {
    return null;
  }

  product.status = "approved";
  product.reviewedAt = new Date().toISOString();
  writeStore(store);
  return product;
}

function addUser(payload) {
  const store = readStore();
  const email = String(payload.email || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    badRequest("Valid email required.");
  }

  if (String(payload.password || "").length < 6) {
    badRequest("Password kam az kam 6 characters ka hona chahiye.");
  }

  if (store.users.some((user) => String(user.email).toLowerCase() === email)) {
    badRequest("Is email se account pehle se mojood hai.");
  }

  const user = {
    id: createId("u"),
    name: payload.name || "New User",
    email,
    password: payload.password || "secret123",
    role: String(payload.role || "buyer").toLowerCase(),
    status: "active",
    createdAt: new Date().toISOString()
  };

  store.users.push(user);
  writeStore(store);
  return user;
}

function loginUser(payload) {
  const store = readStore();
  return store.users.find((user) =>
    String(user.email).toLowerCase() === String(payload.email || "").trim().toLowerCase() &&
    user.password === payload.password &&
    (!payload.role || user.role === String(payload.role).toLowerCase())
  );
}

function addOrder(payload) {
  const store = readStore();
  const order = {
    id: createId("o"),
    buyerId: payload.buyerId || "u_buyer",
    sellerId: payload.sellerId || "u_1",
    items: payload.items || [],
    totalAmount: Number(payload.totalAmount || 0),
    status: "placed",
    paymentStatus: "escrow_hold",
    shippingStatus: "processing",
    createdAt: new Date().toISOString()
  };

  store.orders.push(order);
  writeStore(store);
  return order;
}

function getSellerDashboard() {
  const store = readStore();
  const seller = store.users.find((user) => user.role === "seller") || store.users[0];
  const sellerProducts = store.products.filter((product) => product.sellerId === seller.id || seller.id === "u_1");
  const sellerOrders = store.orders.filter((order) => order.sellerId === seller.id || seller.id === "u_1");

  return {
    seller,
    metrics: {
      monthlyGmv: "PKR 3200000",
      ordersThisWeek: sellerOrders.length,
      rating: 4.8,
      products: sellerProducts.length
    },
    orders: sellerOrders,
    products: sellerProducts
  };
}

function getAdminSummary() {
  const store = readStore();
  return {
    moderationQueues: {
      newListings: store.products.filter((product) => product.status === "pending_review").length,
      piracyReports: store.piracyReports.filter((item) => item.status === "open").length,
      disputes: store.disputes.filter((item) => item.status === "review").length
    },
    piracyReports: store.piracyReports,
    disputes: store.disputes,
    riskySellers: store.sellers
  };
}

function getOrders() {
  return readStore().orders;
}

module.exports = {
  addOrder,
  addProduct,
  addUser,
  approveProduct,
  getAdminSummary,
  getOrders,
  getProduct,
  getSellerDashboard,
  listProducts,
  loginUser
};
