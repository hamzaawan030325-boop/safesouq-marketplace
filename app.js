const fallbackProducts = [
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
  drafts: "safesouq-seller-drafts",
  session: "safesouq-session"
};

const API_BASE = window.location.protocol.startsWith("http")
  ? ""
  : "http://localhost:4000";

let currentProducts = [...fallbackProducts];
let currentFilter = "all";

function isHostedMode() {
  return window.location.protocol.startsWith("http");
}

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

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || payload.detail || `Request failed with status ${response.status}`);
  }

  return payload;
}

function priceLabel(value) {
  if (typeof value === "number") {
    return `$${value}`;
  }

  return value || "N/A";
}

function visualTone(category) {
  const tones = {
    beauty: "linear-gradient(135deg, rgba(52, 211, 153, 0.35), rgba(15, 23, 42, 0.1))",
    electronics: "linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(15, 23, 42, 0.1))",
    fashion: "linear-gradient(135deg, rgba(244, 114, 182, 0.35), rgba(15, 23, 42, 0.1))",
    home: "linear-gradient(135deg, rgba(192, 132, 252, 0.35), rgba(15, 23, 42, 0.1))",
    travel: "linear-gradient(135deg, rgba(255, 122, 24, 0.35), rgba(15, 23, 42, 0.1))"
  };

  return tones[category] || "linear-gradient(135deg, rgba(251, 191, 36, 0.35), rgba(15, 23, 42, 0.1))";
}

function renderProducts() {
  if (!productGrid) {
    return;
  }

  const visibleProducts = currentFilter === "all"
    ? currentProducts
    : currentProducts.filter((product) => product.category === currentFilter);

  productGrid.innerHTML = "";

  visibleProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-visual" style="background:${product.tone || visualTone(product.category)}">
        <span>${product.seller || "Marketplace Seller"}</span>
      </div>
      <div class="product-body">
        <h3>${product.title}</h3>
        <p>${product.description || "Verified marketplace listing with moderated catalog visibility."}</p>
        <div class="product-meta">
          <span class="price">${priceLabel(product.price)}</span>
          <span class="badge">${product.status === "pending_review" ? "Pending review" : (product.verified || "Live listing")}</span>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });

  if (!visibleProducts.length) {
    productGrid.innerHTML = '<article class="product-card"><div class="product-body"><h3>No products yet</h3><p>Seller listings abhi moderation ya onboarding stage me hain.</p></div></article>';
  }
}

function renderDrafts(items = null) {
  if (!sellerDraftList) {
    return;
  }

  const drafts = items || readLocalJson(STORAGE_KEYS.drafts, []);
  sellerDraftList.innerHTML = "";

  if (!drafts.length) {
    sellerDraftList.innerHTML = '<div class="list-row"><strong>No listing yet</strong><span>Form se apna pehla product add karein</span></div>';
    return;
  }

  drafts.slice().reverse().forEach((draft) => {
    const row = document.createElement("div");
    row.className = "list-row";
    row.innerHTML = `<strong>${draft.title}</strong><span>${draft.category} | ${priceLabel(draft.price)} | ${draft.status || "pending_review"}</span>`;
    sellerDraftList.appendChild(row);
  });
}

async function loadProducts() {
  if (!productGrid || !isHostedMode()) {
    renderProducts();
    return;
  }

  try {
    const payload = await apiRequest("/api/v1/products");
    currentProducts = payload.data.map((item) => ({
      ...item,
      seller: item.seller || "Verified seller",
      verified: item.status === "approved" ? "Approved" : "Pending review",
      tone: visualTone(item.category)
    }));
  } catch (error) {
    currentProducts = [...fallbackProducts];
  }

  renderProducts();
}

async function loadSellerDashboard() {
  if (!sellerDraftList) {
    return;
  }

  if (!isHostedMode()) {
    renderDrafts();
    return;
  }

  try {
    const payload = await apiRequest("/api/v1/seller/dashboard");
    renderDrafts(payload.data.products || []);
  } catch (error) {
    renderDrafts();
    if (sellerFormMessage) {
      sellerFormMessage.textContent = "Live backend se seller data load nahi ho saka.";
    }
  }
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    renderProducts();
  });
});

loadProducts();

if (authForm) {
  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(authForm);
    const role = String(formData.get("role") || "").toLowerCase();
    const otp = String(formData.get("otp") || "");
    const email = String(formData.get("email") || "").trim().toLowerCase();

    if (otp.length < 6) {
      authMessage.textContent = "OTP kam az kam 6 digits ka hona chahiye.";
      return;
    }

    try {
      const payload = await apiRequest("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password: String(formData.get("password") || ""),
          role
        })
      });
      writeLocalJson(STORAGE_KEYS.session, payload.data.user);
      authMessage.textContent = `${payload.data.user.name} login ho gaya. Ab seller dashboard use kar sakte hain.`;
    } catch (error) {
      authMessage.textContent = error.message;
    }
  });

  if (createAccountBtn) {
    createAccountBtn.addEventListener("click", async () => {
      const formData = new FormData(authForm);
      const user = {
        name: String(formData.get("name") || "").trim(),
        email: String(formData.get("email") || "").trim().toLowerCase(),
        role: String(formData.get("role") || "").toLowerCase(),
        password: String(formData.get("password") || "").trim()
      };

      if (!user.name) {
        authMessage.textContent = "Full name required hai.";
        return;
      }

      try {
        const payload = await apiRequest("/api/v1/auth/register", {
          method: "POST",
          body: JSON.stringify(user)
        });
        authMessage.textContent = `Account create ho gaya: ${payload.data.email} (${payload.data.role}). Ab login karein.`;
      } catch (error) {
        if (!isHostedMode()) {
          authMessage.textContent = "File preview mode me backend available nahi. Isko live server se kholo.";
          return;
        }

        authMessage.textContent = error.message;
      }
    });
  }
}

if (sellerProductForm) {
  sellerProductForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(sellerProductForm);
    const item = {
      title: String(formData.get("title") || "Untitled product"),
      category: String(formData.get("category") || "general").toLowerCase(),
      price: String(formData.get("price") || "0"),
      stock: String(formData.get("stock") || "0"),
      description: String(formData.get("description") || "")
    };

    try {
      await apiRequest("/api/v1/seller/products", {
        method: "POST",
        body: JSON.stringify(item)
      });
      sellerFormMessage.textContent = "Product successfully submit ho gaya. Ab moderation ke baad live dikhega.";
      await loadSellerDashboard();
      await loadProducts();
    } catch (error) {
      if (!isHostedMode()) {
        const drafts = readLocalJson(STORAGE_KEYS.drafts, []);
        drafts.push({ ...item, status: "local draft only" });
        writeLocalJson(STORAGE_KEYS.drafts, drafts);
        sellerFormMessage.textContent = "Local preview mode hai. Product sirf browser draft me save hua.";
        renderDrafts(drafts);
        return;
      }

      sellerFormMessage.textContent = error.message;
    }
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
        status: "draft saved"
      });
      writeLocalJson(STORAGE_KEYS.drafts, drafts);
      sellerFormMessage.textContent = "Draft local browser me save ho gaya.";
      renderDrafts(drafts);
    });
  }

  loadSellerDashboard();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {
      // Ignore service worker registration failure in preview mode.
    });
  });
}
