const ANALYTICS_API_URL = 'https://api.firecms.co/analytics';

export class Analytics {
    private apiUrl: string;
    private sessionId: string | null = null;
    private maxScroll: number = 0;
    private pageLoadTime: number = Date.now();

    constructor(apiUrl: string) {
        this.apiUrl = apiUrl;
        this.sessionId = this.getOrCreateSessionId();
        this.initGlobalListeners();
    }

    private getOrCreateSessionId(): string {
        let sessionId = sessionStorage.getItem('analytics_session');
        if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('analytics_session', sessionId);
        }
        return sessionId;
    }

    private initGlobalListeners() {
        // Click tracking - global, doesn't need reset
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const trackedElement = target.closest('[data-track]');
            if (trackedElement) {
                this.trackEvent('button_click', {
                    element_id: trackedElement.id,
                    element_text: trackedElement.textContent?.trim()
                });
            }

            const link = target.closest('a[href^="http"]');
            if (link) {
                const url = (link as HTMLAnchorElement).href;
                if (!url.includes(window.location.hostname)) {
                    this.trackEvent('outbound_link', {
                        destination_url: url
                    });
                }
            }
        });

        // Scroll tracking - global listener, but we reset state
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > this.maxScroll) {
                this.maxScroll = Math.floor(scrollPercent / 25) * 25;
            }
        });

        // Browser close/reload
        window.addEventListener('beforeunload', () => {
            this.sendExitEvents();
        });

        // Astro navigation (SPA-like)
        document.addEventListener('astro:before-swap', () => {
            this.sendExitEvents();
        });

        // Astro page load (New page ready)
        document.addEventListener('astro:page-load', () => {
            this.resetPageMetrics();
            this.trackPageView();
        });
    }

    private resetPageMetrics() {
        this.maxScroll = 0;
        this.pageLoadTime = Date.now();
    }

    private sendExitEvents() {
        const timeOnPage = Math.floor((Date.now() - this.pageLoadTime) / 1000);

        if (this.maxScroll > 0) {
            this.trackEvent('scroll_depth', { scroll_percentage: this.maxScroll }, true);
        }

        this.trackEvent('time_on_page', { duration_seconds: timeOnPage }, true);
    }

    public async trackEvent(eventType: string, eventData: any = {}, useBeacon: boolean = false) {
        try {
            const payload = {
                event_type: eventType,
                page_path: window.location.pathname,
                page_title: document.title,
                referrer: document.referrer,
                screen_resolution: `${window.screen.width}x${window.screen.height}`,
                viewport_size: `${window.innerWidth}x${window.innerHeight}`,
                language: navigator.language,
                session_id: this.sessionId,
                event_data: eventData
            };

            console.debug('Analytics tracking:', eventType, payload);

            if (useBeacon) {
                const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
                navigator.sendBeacon(`${this.apiUrl}/track`, blob);
            } else {
                await fetch(`${this.apiUrl}/track`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload)
                });
            }
        } catch (error) {
            console.error('Analytics error:', error);
        }
    }

    public trackPageView() {
        this.trackEvent('page_view');
    }
}

// Initialize singleton
if (!(window as any).analytics) {
    (window as any).analytics = new Analytics(ANALYTICS_API_URL);
}
