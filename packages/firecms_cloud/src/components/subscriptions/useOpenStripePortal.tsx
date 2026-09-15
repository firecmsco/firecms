import { useCallback, useEffect, useState } from "react";
import { useSnackbarController, useTranslation } from "@firecms/core";

/**
 * Open a Stripe billing portal page (cancel, change seats, update the card)
 * when the user asks for it.
 *
 * Each link is a portal session Stripe creates on request, so it is fetched
 * on click, not on render. Fetching on render created sessions on every view
 * of the settings page for buttons nobody pressed, and a failure became an
 * unhandled rejection the user never saw (Sentry FIRECMS-SASS-11M, -12F,
 * -12H). A failure now shows in the snackbar.
 *
 * The portal opens in this tab: a new tab opened after waiting for the link
 * would be blocked as a popup, and the session returns to this page anyway.
 *
 * `opening` is the key of the link being fetched, so a component with several
 * buttons can show which one is working and disable the rest.
 */
export function useOpenStripePortal() {

    const snackbarController = useSnackbarController();
    const { t } = useTranslation();
    const [opening, setOpening] = useState<string | undefined>();

    // Coming back with the Back button can restore this page from the
    // back/forward cache, still showing the spinner it was left with.
    useEffect(() => {
        const onPageShow = (event: PageTransitionEvent) => {
            if (event.persisted) setOpening(undefined);
        };
        window.addEventListener("pageshow", onPageShow);
        return () => window.removeEventListener("pageshow", onPageShow);
    }, []);

    const openPortal = useCallback(async (key: string, fetchLink: () => Promise<string>) => {
        setOpening(key);
        try {
            const url = await fetchLink();
            if (!url)
                throw new Error("No link was returned");
            // Leave the spinner on while the browser navigates away.
            window.location.assign(url);
        } catch (error) {
            console.error("Error opening the Stripe billing portal", error);
            setOpening(undefined);
            snackbarController.open({
                type: "error",
                message: t("stripe_portal_error", {
                    message: error instanceof Error ? error.message : String(error)
                })
            });
        }
    }, [snackbarController, t]);

    return {
        openPortal,
        opening
    };
}
