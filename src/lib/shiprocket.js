const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

export async function getShiprocketToken() {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
        throw new Error("Shiprocket credentials are missing.");
    }

    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
        throw new Error(
            data.message || "Unable to authenticate with Shiprocket."
        );
    }

    return data.token;
}

export async function shiprocketRequest(path, token, options = {}) {
    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
        cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || `Shiprocket API failed (${response.status}).`
        );
    }

    return data;
}
