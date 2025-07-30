// Analytics tracking for navbar buttons
function waitForElement(selector, callback, maxAttempts = 50) {
    let attempts = 0;

    function checkForElement() {
        const element = document.getElementById(selector);
        if (element) {
            callback(element);
        } else {
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(checkForElement, 100);
            } else {
                console.log(`Element with ID ${selector} not found after ${maxAttempts} attempts`);
            }
        }
    }

    checkForElement();
}

function setupAnalyticsTracking() {
    console.log("Setting up analytics tracking for navbar...");

    waitForElement("sign-in-btn", (signInBtn) => {
        console.log("Sign in button found, attaching listener...", signInBtn);

        // Remove any existing listener to avoid duplicates
        signInBtn.removeEventListener("click", handleSignInClick);

        // Add the click listener
        signInBtn.addEventListener("click", handleSignInClick);
    });
}

function handleSignInClick() {
    console.log("Sign in button clicked, tracking event...");

    // Try multiple analytics approaches

    // 1. Try Docusaurus analytics API
    if (typeof window !== 'undefined' && window.gtag) {
        console.log("Using window.gtag");
        window.gtag("event", "go_to_app", {
            event_category: "navbar",
            event_label: "Sign in"
        });
        return;
    }

    // 2. Try Google Analytics 4 directly
    if (typeof window !== 'undefined' && window.dataLayer) {
        console.log("Using dataLayer.push");
        window.dataLayer.push({
            event: 'go_to_app',
            event_category: 'navbar',
            event_label: 'Sign in'
        });
        return;
    }

    // 3. Try to find gtag in the global scope
    const gtag = window.gtag || window.dataLayer?.gtag;
    if (gtag) {
        console.log("Using found gtag function");
        gtag("event", "go_to_app", {
            event_category: "navbar",
            event_label: "Sign in"
        });
        return;
    }

    // 4. Manual dataLayer push as fallback
    if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        console.log("Using manual dataLayer push", window.dataLayer);
        window.dataLayer.push({
            event: 'go_to_app',
            event_category: 'navbar',
            event_label: 'Sign in'
        });
        return;
    }

    console.log("No analytics method available", window);
}

// Run when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupAnalyticsTracking);
} else {
    setupAnalyticsTracking();
}

// Also run on route changes (for SPA navigation)
if (typeof window !== "undefined") {
    window.addEventListener("load", setupAnalyticsTracking);
}
