const products = [
  {
    title: "Smart Watch Ultra",
    seller: "Nexa Digital Store",
    price: "$79",
    verified: "Verified seller",
    category: "electronics",
    tone: "linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(15, 23, 42, 0.1))"
  },
  {
    title: "Premium Abaya Collection",
    seller: "Noor Fashion House",
    price: "$49",
    verified: "Brand protected",
    category: "fashion",
    tone: "linear-gradient(135deg, rgba(244, 114, 182, 0.35), rgba(15, 23, 42, 0.1))"
  },
  {
    title: "Organic Skin Care Kit",
    seller: "Luna Beauty Lab",
    price: "$35",
    verified: "Authenticity checked",
    category: "beauty",
    tone: "linear-gradient(135deg, rgba(52, 211, 153, 0.35), rgba(15, 23, 42, 0.1))"
  },
  {
    title: "Wireless Gaming Headset",
    seller: "Pixel Planet",
    price: "$64",
    verified: "Low fraud risk",
    category: "electronics",
    tone: "linear-gradient(135deg, rgba(251, 191, 36, 0.35), rgba(15, 23, 42, 0.1))"
  },
  {
    title: "Home Decor Lamp",
    seller: "Casa Aura",
    price: "$28",
    verified: "Quality reviewed",
    category: "home",
    tone: "linear-gradient(135deg, rgba(192, 132, 252, 0.35), rgba(15, 23, 42, 0.1))"
  },
  {
    title: "Travel Backpack Pro",
    seller: "Roam Supply Co",
    price: "$55",
    verified: "Escrow eligible",
    category: "travel",
    tone: "linear-gradient(135deg, rgba(255, 122, 24, 0.35), rgba(15, 23, 42, 0.1))"
  }
];

const productGrid = document.getElementById("productGrid");
const filterButtons = document.querySelectorAll("[data-filter]");
const authForm = document.getElementById("authForm");
const authMessage = document.getElementById("authMessage");
const createAccountBtn = document.getElementById("createAccountBtn");
const sellerProductForm = document.getElementById("sellerProductForm");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const sellerDraftList = document.getElementById("sellerDraftList");
const sellerFormMessage = document.getElementById("sellerFormMessage");

const STORAGE_KEYS = {
  users: "safesouq-users",
  drafts: "safesouq-seller-drafts"
};

const API_BASE = window.location.protocol.startsWith("http")
  ? ""
  : "http://localhost:4000";

function readLocalJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

function renderProducts(category = "all") {
  if (!productGrid) {
    return;
  }

  const visibleProducts = category === "all"
    ? products
    : products.filter((product) => product.category === category);

  productGrid.innerHTML = "";

  visibleProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-visual" style="background:${product.tone}">
        <span>${product.seller}</span>
      </div>
      <div class="product-body">
        <h3>${product.title}</h3>
        <p>Marketplace-ready listing with seller verification and moderated catalog visibility.</p>
        <div class="product-meta">
          <span class="price">${product.price}</span>
          <span class="badge">${product.verified}</span>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

function renderDrafts() {
  if (!sellerDraftList) {
    return;
  }

  const drafts = readLocalJson(STORAGE_KEYS.drafts, []);
  sellerDraftList.innerHTML = "";

  if (!drafts.length) {
    sellerDraftList.innerHTML = '<div class="list-row"><strong>No draft yet</strong><span>Use the form to create one</span></div>';
    return;
  }

  drafts.slice().reverse().forEach((draft) => {
    const row = document.createElement("div");
    row.className = "list-row";
    row.innerHTML = `<strong>${draft.title}</strong><span>${draft.category} | ${draft.price} | ${draft.status}</span>`;
    sellerDraftList.appendChild(row);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderProducts(button.dataset.filter);
  });
});

renderProducts();

if (authForm) {
  authForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(authForm);
    const role = String(formData.get("role") || "").toLowerCase();
    const otp = String(formData.get("otp") || "");
    const email = String(formData.get("email") || "");

    if (otp.length < 6) {
      authMessage.textContent = "OTP kam az kam 6 digits ka hona chahiye.";
      return;
    }

    apiRequest("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: String(formData.get("password") || ""),
        role
      })
    }).then((payload) => {
      authMessage.textContent = `${payload.data.user.role} account ${payload.data.user.email} login ho gaya.`;
    }).catch(() => {
      authMessage.textContent = `${role} account ${email} ke liye secure login demo successful.`;
    });
  });

  if (createAccountBtn) {
    createAccountBtn.addEventListener("click", () => {
      const formData = new FormData(authForm);
      const users = readLocalJson(STORAGE_KEYS.users, []);
      const user = {
        name: "Demo User",
        email: String(formData.get("email") || ""),
        role: String(formData.get("role") || "").toLowerCase(),
        password: String(formData.get("password") || ""),
        createdAt: new Date().toISOString()
      };
      apiRequest("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(user)
      }).then((payload) => {
        authMessage.textContent = `Account create ho gaya: ${payload.data.email} (${payload.data.role}).`;
      }).catch(() => {
        users.push(user);
        writeLocalJson(STORAGE_KEYS.users, users);
        authMessage.textContent = `Demo account create ho gaya: ${user.email} (${user.role}).`;
      });
    });
  }
}

if (sellerProductForm) {
  sellerProductForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(sellerProductForm);
    const item = {
      title: String(formData.get("title") || "Untitled product"),
      category: String(formData.get("category") || "General"),
      price: String(formData.get("price") || "N/A"),
      stock: String(formData.get("stock") || "0"),
      description: String(formData.get("description") || ""),
      status: "pending_review",
      createdAt: new Date().toISOString()
    };

    apiRequest("/api/v1/seller/products", {
      method: "POST",
      body: JSON.stringify(item)
    }).then(() => {
      sellerFormMessage.textContent = "Product backend moderation queue me submit ho gaya hai.";
    }).catch(() => {
      const drafts = readLocalJson(STORAGE_KEYS.drafts, []);
      drafts.push({ ...item, status: "submitted for moderation" });
      writeLocalJson(STORAGE_KEYS.drafts, drafts);
      sellerFormMessage.textContent = "Product local demo queue me submit ho gaya hai.";
      renderDrafts();
    });
  });

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener("click", () => {
      const formData = new FormData(sellerProductForm);
      const drafts = readLocalJson(STORAGE_KEYS.drafts, []);
      drafts.push({
        title: String(formData.get("title") || "Untitled product"),
        category: String(formData.get("category") || "General"),
        price: String(formData.get("price") || "N/A"),
        stock: String(formData.get("stock") || "0"),
        description: String(formData.get("description") || ""),
        status: "draft saved",
        createdAt: new Date().toISOString()
      });
      writeLocalJson(STORAGE_KEYS.drafts, drafts);
      sellerFormMessage.textContent = "Draft browser storage me save ho gaya.";
      renderDrafts();
    });
  }

  renderDrafts();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      // Ignore registration failures in simple local preview mode.
    });
  });
}
