import { useCallback, useEffect, useRef } from "react";

/**
 * Reports a visitor leaving a screen without doing the thing the screen exists
 * to get them to do.
 *
 * Screens normally emit "shown" and "did the thing", and nothing at all for the
 * people who do neither — the largest group on the Cloud login screen, where
 * between a third and a half of everyone who arrives never clicks any sign-in
 * method. Those exits leave no event, so there is nothing to tell apart the
 * visitor with no Google session from the one who read the permissions wording
 * and backed out.
 *
 * `report` is called at most once per mount, and never once `markResolved` has
 * been called, so a screen that unmounts *because* the visitor succeeded does
 * not also read as an abandonment.
 *
 * It fires on `pagehide` as well as on unmount: closing the tab or switching
 * apps on a phone unmounts nothing, and `beforeunload` does not fire on mobile
 * Safari or Chrome for Android.
 *
 * @param report called with why the screen was left and how long the visitor
 *   was on it. Read anything else you want to send through a ref: this is
 *   deliberately not re-subscribed when the callback identity changes, because
 *   hosts pass a fresh closure on every render and resubscribing would run the
 *   cleanup — and so report an abandonment — on each one.
 */
export function useAbandonmentReporter(
    report: (reason: "page_hidden" | "unmounted", secondsOnScreen: number) => void
): { markResolved: () => void } {

    const reportRef = useRef(report);
    reportRef.current = report;

    const resolvedRef = useRef(false);
    const reportedRef = useRef(false);
    const shownAtRef = useRef(Date.now());

    const markResolved = useCallback(() => {
        resolvedRef.current = true;
    }, []);

    useEffect(() => {
        const fire = (reason: "page_hidden" | "unmounted") => {
            if (resolvedRef.current || reportedRef.current) return;
            reportedRef.current = true;
            reportRef.current(reason, Math.round((Date.now() - shownAtRef.current) / 1000));
        };
        const onPageHide = () => fire("page_hidden");
        window.addEventListener("pagehide", onPageHide);
        return () => {
            window.removeEventListener("pagehide", onPageHide);
            fire("unmounted");
        };
    }, []);

    return { markResolved };
}
