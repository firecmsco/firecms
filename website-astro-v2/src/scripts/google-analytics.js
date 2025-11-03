// Google Analytics initialization script
// This script handles GA setup with Consent Mode v2

// Define dataLayer and the gtag function ONCE
window.dataLayer = window.dataLayer || [];
function gtag() {
    dataLayer.push(arguments);
}

// Make gtag available globally
window.gtag = gtag;

// Default consent to 'denied' as a placeholder (Consent Mode v2)
// This must be set before the Google tag loads
gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied'
});

// Check if user has already consented
const cookieConsent = localStorage.getItem('cookie-consent');
if (cookieConsent === 'accepted') {
    gtag('consent', 'update', {
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted',
        'analytics_storage': 'granted'
    });
}

// Initialize Google Analytics
gtag("js", new Date());
gtag("config", "G-NL75PPNYXD", {
    send_page_view: true
});

// Also track on initial load (before Astro takes over)
if (typeof gtag === 'function') {
    console.log('Initial pageview tracked:', window.location.pathname);
}

