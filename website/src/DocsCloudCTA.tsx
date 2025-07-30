import React from "react";

export function DocsCloudCTA() {
    return <a href="https://app.firecms.co"
              rel="noopener noreferrer"
              target="_blank"
              onClick={() => {
                  // @ts-ignore
                  if (window.gtag) {
                      // @ts-ignore
                      window.gtag("event", "go_to_app", {
                          event_category: "docs",
                          event_label: "cloud_cta"
                      });
                  }
              }}
              className="btn px-6 my-4 py-2 md:px-8 md:py-3 !text-white bg-primary hover:text-white hover:bg-blue-700 uppercase border-solid rounded text-center">
        Go to FireCMS Cloud
    </a>;
}
