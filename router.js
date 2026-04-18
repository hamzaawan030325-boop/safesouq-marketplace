const path = require("path");
const {
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
} = require("./store");
const { json, notFound, parseBody, safeStaticPath, serveFile, writeAudit } = require("./security");

const PUBLIC_ROOT = path.join(__dirname, "..", "..");

async function route(request, response) {
  const url = new URL(request.url, "http://localhost:4000");

  if (request.method === "OPTIONS") {
    json(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    json(response, 200, { ok: true, service: "safesouq-fullstack" });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/v1/products") {
    json(response, 200, {
      data: listProducts(url.searchParams.get("category")),
      audit: writeAudit("products listed")
    });
    return;
  }

  if (request.method === "GET" && url.pathname.startsWith("/api/v1/products/")) {
    const product = getProduct(url.pathname.split("/").pop());
    if (!product) {
      notFound(response);
      return;
    }
    json(response, 200, { data: product, audit: writeAudit("product viewed") });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/v1/auth/register") {
    const payload = await parseBody(request);
    const user = addUser(payload);
    json(response, 201, { data: user, audit: writeAudit("account created") });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/v1/auth/login") {
    const payload = await parseBody(request);
    const user = loginUser(payload);

    if (!user) {
      json(response, 401, { error: "Invalid credentials" });
      return;
    }

    json(response, 200, {
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken: `demo-token-${user.id}`
      },
      audit: writeAudit("login successful")
    });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/v1/seller/dashboard") {
    json(response, 200, { data: getSellerDashboard(), audit: writeAudit("dashboard viewed") });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/v1/seller/products") {
    const payload = await parseBody(request);
    const product = addProduct(payload);
    json(response, 201, { data: product, audit: writeAudit("product submitted") });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/v1/seller/orders") {
    json(response, 200, { data: getOrders(), audit: writeAudit("seller orders viewed") });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/v1/checkout") {
    const payload = await parseBody(request);
    const order = addOrder(payload);
    json(response, 201, { data: order, audit: writeAudit("checkout created") });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/v1/admin/moderation/queues") {
    json(response, 200, { data: getAdminSummary(), audit: writeAudit("admin queues viewed") });
    return;
  }

  if (request.method === "POST" && url.pathname.startsWith("/api/v1/admin/products/") && url.pathname.endsWith("/approve")) {
    const parts = url.pathname.split("/");
    const productId = parts[parts.length - 2];
    const product = approveProduct(productId);

    if (!product) {
      notFound(response);
      return;
    }

    json(response, 200, { data: product, audit: writeAudit("product approved") });
    return;
  }

  const filePath = safeStaticPath(PUBLIC_ROOT, url.pathname);
  if (filePath && serveFile(response, filePath)) {
    return;
  }

  if (serveFile(response, path.join(PUBLIC_ROOT, "index.html"))) {
    return;
  }

  notFound(response);
}

module.exports = {
  route
};
