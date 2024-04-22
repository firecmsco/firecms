import * as Sentry from "@sentry/browser";
import React from "react";
import { createRoot } from "react-dom/client";
import { SaasApp } from "./SaasApp";
import "./index.css";

// @ts-ignore
import { BrowserTracing } from "@sentry/tracing";

if (process.env.NODE_ENV === "production") {
    Sentry.init({
        dsn: "https://71d97a93324e41888ae8aa9be10f31b2@o4504775215087616.ingest.sentry.io/4504775222165509",
        normalizeDepth: 8,
        integrations: [new BrowserTracing()],
        // This sets the sample rate to be 10%. You may want this to be 100% while
        // in development and sample at a lower rate in production
        replaysSessionSampleRate: 0.1,
        // If the entire session is not sampled, use the below sample rate to sample
        // sessions when an error occurs.
        replaysOnErrorSampleRate: 1.0,
        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,
        beforeSend(event) {
            console.log("Sentry event", event);
            // // Check if it is an exception, and if so, show the report dialog
            // if (event.exception) {
            //     Sentry.showReportDialog({ eventId: event.event_id });
            // }
            return event;
        }
    });
}

const container = document.getElementById("root");
const root = createRoot(container as any);
root.render(
    <React.StrictMode>
        <SaasApp/>
    </React.StrictMode>
);
