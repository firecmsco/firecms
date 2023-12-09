import { useEffect } from "react";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
    }
}

export const RECAPTCHA_CONTAINER_ID = "recaptcha-container" as const;

export function useRecaptcha() {
    useEffect(() => {
        if (!window || window?.recaptchaVerifier) return;

        const auth = getAuth();

        window.recaptchaVerifier = new RecaptchaVerifier(
            auth,
            RECAPTCHA_CONTAINER_ID,
            {
                size: "invisible"
            }
        );
    }, []);

    return null;
}
