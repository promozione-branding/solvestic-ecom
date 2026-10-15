
export function createPermalink(value = "") {
    return value
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function validateBlogFields({ title, date, permalink, content }) {
    if (
        !String(title || "").trim() ||
        !String(date || "").trim() ||
        !String(permalink || "").trim() ||
        !String(content || "").trim()
    ) {
        return "Title, date, permalink and content are required.";
    }

    if (Number.isNaN(new Date(date).getTime())) {
        return "Please provide a valid blog date.";
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(permalink)) {
        return "Permalink must contain lowercase letters, numbers and hyphens only.";
    }

    return null;
}
