
export function addToWishlist(product) {
    try {
        const key = "solvestic_wishlist";
        const items = JSON.parse(localStorage.getItem(key) || "[]");
        const id = String(product._id || product.id);

        if (!items.some((item) => String(item._id || item.id) === id)) {
            items.push(product);
            localStorage.setItem(key, JSON.stringify(items));
        }

        return true;
    } catch {
        return false;
    }
}
