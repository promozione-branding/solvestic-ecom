
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getFirebaseAdminApp() {
    const existingApp = getApps().find(
        (app) => app.name === "solvestic-admin"
    );

    if (existingApp) {
        return existingApp;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n"
    );

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Firebase Admin credentials are missing. Check your environment variables."
        );
    }

    return initializeApp(
        {
            credential: cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        },
        "solvestic-admin"
    );
}

export function getFirebaseAdminAuth() {
    return getAuth(getFirebaseAdminApp());
}
