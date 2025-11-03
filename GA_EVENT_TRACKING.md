# 📊 Google Analytics Event Tracking: go_to_app

## Overview

Every click on an `app.firecms.co` link now automatically sends a `go_to_app` event to Google Analytics, allowing you to track user navigation to your SaaS application.

## Event Details

### Event Name
`go_to_app`

### Event Parameters
```javascript
{
  event_category: 'navigation',      // Type of interaction
  event_label: 'https://app.firecms.co/...',  // Full URL with tracking params
  page_path: '/pricing',             // Page where click occurred
  link_text: 'Try FireCMS Cloud',    // Text content of the link
  link_url: 'https://app.firecms.co/...'  // Full destination URL
}
```

## Implementation

### Where It's Tracked

1. **AppLink Component** (React)
   - All `<AppLink>` components with `app.firecms.co` URLs
   - Both website directories

2. **Plain HTML Links** (Astro v2)
   - All `<a href="app.firecms.co">` tags
   - Automatically enhanced via `enhance-app-links.js`

3. **Navbar Links** (Docusaurus)
   - All navbar items pointing to `app.firecms.co`
   - Via `NavbarItem` wrapper

### Implementation Locations

```
website-astro-v2/
├── src/components/AppLink.tsx          ✅ Tracks clicks
├── src/scripts/enhance-app-links.js    ✅ Tracks clicks on all links

website/
├── src/AppLink.tsx                      ✅ Tracks clicks
└── src/theme/NavbarItem/index.jsx      ✅ Tracks clicks
```

## Google Analytics Setup

### 1. View Events in GA4

**Real-time:**
- Go to GA4 → Reports → Realtime
- Look for `go_to_app` events

**Analysis:**
- Go to GA4 → Reports → Engagement → Events
- Find `go_to_app` in the list

### 2. Create Custom Report

1. Go to **Explore** in GA4
2. Create a **Free Form** report
3. Add dimensions:
   - Event name
   - Page path
   - Link text
   - Link URL
4. Add metrics:
   - Event count
   - Users
   - Sessions

### 3. Set Up Conversion

1. Go to **Admin** → **Events**
2. Find `go_to_app` event
3. Click **Mark as conversion**
4. Now you can track this as a conversion goal!

## Example Queries

### See all app.firecms.co clicks
```javascript
// In GA4 Events Report
Filter: Event name = "go_to_app"
```

### Group by page
```javascript
// Dimensions: Page path, Event count
// See which pages drive most clicks to app
```

### Group by link text
```javascript
// Dimensions: Link text, Event count
// See which CTAs work best
```

## Testing

### Browser Console
```javascript
// Click any app.firecms.co link and check:
// 1. Console log (always shown for debugging)
// 2. GA4 real-time events

// Manual trigger for testing:
gtag('event', 'go_to_app', {
  event_category: 'navigation',
  event_label: 'test_event',
  page_path: window.location.pathname
});
```

### Google Tag Assistant
1. Install [Tag Assistant Chrome Extension](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Visit your site
3. Click app.firecms.co links
4. See events in Tag Assistant

### GA4 DebugView
1. Add `?gtm_debug=1` to your URL
2. Go to GA4 → Configure → DebugView
3. Click links and see events in real-time

## Data You Can Track

### Conversion Funnel
```
Landing Page → Pricing Page → Click "Try Now" → app.firecms.co
     ↓              ↓                ↓                  ↓
Page View      Page View      go_to_app Event     Sign Up (in SaaS)
```

### Top Converting Pages
Which pages send the most traffic to app.firecms.co?
- Homepage?
- Pricing page?
- Docs?
- Blog posts?

### Best Performing CTAs
Which button/link text drives most clicks?
- "Try Free"
- "Get Started"
- "Start Building"
- "Try FireCMS Cloud"

### User Journey
Track the path users take before clicking:
1. Lands on homepage (organic)
2. Visits pricing page
3. Clicks "Start Free Trial" (go_to_app event)
4. Signs up in SaaS

## Combining with Ad Tracking

Now you have **complete attribution**:

```
User Journey:
1. Clicks Google Ad (gclid captured)
2. Lands on firecms.co (tracking params stored)
3. Browses pages (params persist in localStorage)
4. Clicks CTA (go_to_app event + params forwarded)
5. Reaches app.firecms.co with full context
6. Signs up (conversion)

Result:
✅ Google Ads knows which ad drove conversion
✅ GA4 knows which page/CTA was clicked
✅ You know complete user journey
✅ Can optimize every step of the funnel
```

## Advanced: Create Audiences

Use `go_to_app` event to create audiences:

### Example Audiences

**"Clicked but didn't convert"**
- Include: Triggered `go_to_app` event
- Exclude: Completed sign up
- Use for: Retargeting campaigns

**"High intent users"**
- Triggered `go_to_app` from pricing page
- Use for: Priority support, special offers

**"Feature page visitors"**
- Clicked from `/features` or `/docs`
- Use for: Technical content marketing

## Insights You'll Get

### Question: Which marketing campaigns drive the most interest?
**Answer:** Filter `go_to_app` events by `utm_source` and `utm_campaign`

### Question: Which pages are most effective at driving conversions?
**Answer:** Group `go_to_app` events by `page_path`

### Question: Which CTAs work best?
**Answer:** Group `go_to_app` events by `link_text`

### Question: What's my landing page → SaaS conversion rate?
**Answer:** Compare page views to `go_to_app` events

## Dashboard Metrics

Create a GA4 dashboard with:

```
┌─────────────────────────────────────────┐
│  FireCMS App Navigation Dashboard       │
├─────────────────────────────────────────┤
│                                          │
│  Total go_to_app Events    →  1,234     │
│  Unique Users               →    856     │
│  Conversion Rate            →   4.2%     │
│                                          │
│  Top Pages:                              │
│  1. /pricing            →    456 clicks  │
│  2. /                   →    321 clicks  │
│  3. /features           →    234 clicks  │
│                                          │
│  Top CTAs:                               │
│  1. "Try Free"          →    567 clicks  │
│  2. "Get Started"       →    432 clicks  │
│  3. "Start Building"    →    235 clicks  │
│                                          │
│  By Traffic Source:                      │
│  1. Organic             →    512 clicks  │
│  2. Google Ads          →    398 clicks  │
│  3. Social              →    234 clicks  │
└─────────────────────────────────────────┘
```

## Privacy Compliance

- Event tracking is standard GA4 functionality
- No PII is collected
- Only navigation patterns are tracked
- Users can opt-out via cookie consent
- Complies with GDPR/CCPA when used with proper consent management

## Troubleshooting

### Event not showing in GA4?
1. Check browser console for event logs
2. Verify `gtag` is loaded: `typeof gtag` in console
3. Check GA4 measurement ID is correct
4. Wait 24-48 hours for non-real-time reports

### Events duplicating?
- Check if multiple scripts are adding listeners
- Look for `data-tracking-added` attribute on links

### Wrong data in events?
- Check console logs to see what's being sent
- Verify link href and text are correct

## Summary

✅ Every app.firecms.co click is tracked
✅ Rich event data for analysis
✅ Works with ad tracking parameters
✅ Can be marked as GA4 conversion
✅ Enables complete funnel optimization

**Result:** You now have visibility into every step of your user journey from ad click to SaaS signup! 📊

