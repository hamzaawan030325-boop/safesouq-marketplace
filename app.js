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
