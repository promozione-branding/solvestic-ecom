import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_DURATION = 24 * 60 * 60;

function sign(value) {
    return createHmac("sha256", process.env.ADMIN_SESSION_SECRET)
        .update(value)
        .digest("base64url");
}

export function createAdminToken(email) {
    const payload = Buffer.from(
        JSON.stringify({
            email,
            exp: Math.floor(Date.now() / 1000) + SESSION_DURATION,
        })
    ).toString("base64url");

    return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token) {
    try {
        if (!process.env.ADMIN_SESSION_SECRET || !token) {
            return false;
        }

        const [payload, signature] = token.split(".");

        if (!payload || !signature) return false;

        const expected = sign(payload);
        const actualBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expected);

        if (
            actualBuffer.length !== expectedBuffer.length ||
            !timingSafeEqual(actualBuffer, expectedBuffer)
        ) {
            return false;
        }

        const session = JSON.parse(
            Buffer.from(payload, "base64url").toString("utf8")
        );

        return Boolean(
            session.email === process.env.ADMIN_EMAIL &&
            session.exp > Math.floor(Date.now() / 1000)
        );
    } catch {
        return false;
    }
}