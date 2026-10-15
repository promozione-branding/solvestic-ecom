import toast from "react-hot-toast";

const CART_STORAGE_KEY = "solvestic_guest_cart";
const MAX_QUANTITY = 99;
const MAX_CART_ITEMS = 100;
export const CART_UPDATED_EVENT = "solvestic-cart-updated";

export function notifyCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }
}

function isBrowser() {
  return typeof window !== "undefined";
}

function normalizeItem(item) {
  if (!item || typeof item !== "object") return null;

  const productId = String(item.productId || item._id || "").trim();
  const quantity = Number(item.quantity ?? 1);

  const variant = typeof item.variant === "object" && item.variant !== null
    ? {
      size: String(item.variant.size || "").trim(),
      oldPrice: Number(item.variant.oldPrice),
      price: Number(item.variant.price),
    }
    : {
      size: String(item.variant || "").trim(),
      oldPrice: 0,
      price: 0,
    };

  if (!/^[a-f\d]{24}$/i.test(productId)) return null;

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return null;
  }

  if (!variant.size || variant.size.length > 100) return null;

  return {
    productId,
    quantity,
    variant,
  };
}

function getItemKey(item) {
  const size =
    typeof item.variant === "object"
      ? item.variant.size
      : item.variant;

  return `${item.productId}:${String(size || "").toLowerCase()}`;
}

export function getGuestCart() {
  if (!isBrowser()) return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!stored) return [];
    // console.log(stored);

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) return [];

    const uniqueItems = new Map();

    for (const rawItem of parsed) {
      const item = normalizeItem(rawItem);

      if (!item) continue;

      const key = getItemKey(item);
      const existing = uniqueItems.get(key);

      if (existing) {
        existing.quantity = Math.min(
          MAX_QUANTITY,
          existing.quantity + item.quantity
        );
      } else if (uniqueItems.size < MAX_CART_ITEMS) {
        uniqueItems.set(key, item);
      }
    }

    return Array.from(uniqueItems.values());
  } catch {
    return [];
  }
}

export function saveGuestCart(items) {
  if (!isBrowser() || !Array.isArray(items)) return false;

  try {
    const uniqueItems = new Map();

    for (const rawItem of items) {
      const item = normalizeItem(rawItem);

      if (!item) continue;

      const key = getItemKey(item);
      const existing = uniqueItems.get(key);

      if (existing) {
        existing.quantity = Math.min(
          MAX_QUANTITY,
          existing.quantity + item.quantity
        );
      } else if (uniqueItems.size < MAX_CART_ITEMS) {
        uniqueItems.set(key, item);
      }
    }

    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(Array.from(uniqueItems.values()))
    );

    return true;
  } catch {
    // For example, browser storage may be disabled or full.
    return false;
  }
}

export function addToGuestCart(productId, quantity = 1, variant = "") {
  const item = normalizeItem({ productId, quantity, variant });

  if (!item) {
    return { success: false, items: getGuestCart() };
  }

  const items = getGuestCart();
  const key = getItemKey(item);
  const existing = items.find((entry) => getItemKey(entry) === key);

  if (existing) {
    existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + item.quantity);
  } else {
    if (items.length >= MAX_CART_ITEMS) {
      return { success: false, items };
    }

    items.push(item);
  }

  const success = saveGuestCart(items);
  toast.success("Product added to cart successfully!");
  if (success) notifyCartUpdated();

  return {
    success,
    items: success ? getGuestCart() : items,
  };
}

export function updateGuestCartQuantity(productId, quantity, variant = "") {
  const item = normalizeItem({ productId, quantity, variant });

  if (!item) {
    return { success: false, items: getGuestCart() };
  }

  const items = getGuestCart();
  const key = getItemKey(item);
  const existing = items.find((entry) => getItemKey(entry) === key);

  if (!existing) {
    return { success: false, items };
  }

  existing.quantity = item.quantity;

  const success = saveGuestCart(items);

  return { success, items: getGuestCart() };
}

export function removeFromGuestCart(productId, variant = "") {
  const id = String(productId?._id || productId || "").trim();

  const getSize = (value) =>
    String(
      typeof value === "object" && value !== null
        ? value.size || ""
        : value || ""
    )
      .trim()
      .toLowerCase();

  const normalizedVariant = getSize(variant);
  const items = getGuestCart();

  const updatedItems = items.filter(
    (item) =>
      !(
        String(item.productId).trim() === id &&
        getSize(item.variant) === normalizedVariant
      )
  );

  const success = saveGuestCart(updatedItems);
  if (success) notifyCartUpdated();
  return {
    success,
    items: success ? getGuestCart() : items,
  };
}

export function clearGuestCart() {
  if (!isBrowser()) return false;

  try {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function getGuestCartCount() {
  return getGuestCart().reduce((total, item) => total + item.quantity, 0);
}
