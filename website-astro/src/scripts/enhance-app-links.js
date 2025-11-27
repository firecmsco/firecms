// Automatically enhance all app.firecms.co links with tracking parameters
// This script runs on every page to add tracking params to all app.firecms.co links

import { getCurrentTrackingParams, appendTrackingParamsToUrl } from '../utils/gclid.js';

function enhanceAppLinks() {
  const links = document.querySelectorAll('a[href*="app.firecms.co"]');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    try {
      const trackingParams = getCurrentTrackingParams();

      if (Object.keys(trackingParams).length > 0) {
        const enhancedUrl = appendTrackingParamsToUrl(href, trackingParams);
        link.setAttribute('href', enhancedUrl);
      }

      // Add click event tracking if not already added
      if (!link.hasAttribute('data-tracking-added')) {
        link.setAttribute('data-tracking-added', 'true');
        link.addEventListener('click', function(e) {
          // Send Google Analytics event
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'go_to_app', {
              event_category: 'navigation',
              event_label: link.href,
              page_path: window.location.pathname,
              link_text: link.textContent?.trim() || '',
              link_url: link.href
            });
          }

          // Also log to console for debugging
          console.log('go_to_app event:', {
            url: link.href,
            text: link.textContent?.trim(),
            page: window.location.pathname
          });
        });
      }
    } catch (e) {
      console.error('Error enhancing app link:', e);
    }
  });
}

// Enhance links on initial page load
enhanceAppLinks();

// Enhance links after Astro page transitions
document.addEventListener('astro:page-load', () => {
  enhanceAppLinks();
});

// Re-enhance links after any DOM changes (for dynamically added content)
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver((mutations) => {
    // Check if any new links were added
    let hasNewLinks = false;
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          if (node.tagName === 'A' && node.getAttribute('href')?.includes('app.firecms.co')) {
            hasNewLinks = true;
          } else if (node.querySelectorAll) {
            const links = node.querySelectorAll('a[href*="app.firecms.co"]');
            if (links.length > 0) hasNewLinks = true;
          }
        }
      });
    });

    if (hasNewLinks) {
      enhanceAppLinks();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

