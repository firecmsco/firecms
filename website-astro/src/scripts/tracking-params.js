// Capture and store Google Ads and UTM parameters on page load
// This script runs on every page load to capture tracking parameters from the URL

import { captureTrackingParams } from '../utils/gclid.js';

// Capture params immediately when script loads
captureTrackingParams();

// Also capture on Astro page transitions
document.addEventListener('astro:page-load', () => {
  captureTrackingParams();
});

