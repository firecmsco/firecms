// Google Analytics 4 initialization and tracking
// Handles pageview tracking with Astro View Transitions

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
    gtag: (...args: any[]) => void;
    gaInitialized?: boolean;
  }
}

// One-time initialization
if (!window.gaInitialized) {
  window.gaInitialized = true;

  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(...args: any[]) {
    window.dataLayer.push(arguments);
  };

  // Set timestamp - only once
  window.gtag('js', new Date());

  // Set default consents - only once
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
  });

  // Check if user has already consented
  const cookieConsent = localStorage.getItem('cookie-consent');
  if (cookieConsent === 'accepted') {
    window.gtag('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    });
  }

  // Initialize GA4 and let Enhanced Measurement handle pageviews automatically
  window.gtag('config', 'G-NL75PPNYXD');
}

// Export to make this a proper ES module
export {};

