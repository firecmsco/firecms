import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebase_config";

/**
 * Whether firebase_config.ts holds a real project's config.
 *
 * The template ships placeholders, and `firecms init` fills them in when you are logged in.
 * Until then the website has nothing to read and the CMS cannot sign anyone in, so the data
 * functions answer empty instead of failing the build with an invalid API key.
 */
export const firebaseConfigured = Boolean(firebaseConfig.projectId)
    && Object.values(firebaseConfig).every(value =>
        typeof value === "string"
        && value.length > 0
        // The placeholders this template ships: `YOUR_API_KEY`, and the bracketed project
        // id the CLI substitutes. No value of a real config looks like either.
        && !value.startsWith("YOUR_")
        && !value.includes("["));

if (!firebaseConfigured && typeof window === "undefined") {
    console.warn("[FireCMS] src/app/common/firebase_config.ts still holds the template's placeholders:"
        + " the website will show no content and the CMS cannot sign in. Fill it in with your Firebase"
        + " web app config.");
}

export const firebaseApp = initializeApp(firebaseConfig);

export const storage = getStorage(firebaseApp);
