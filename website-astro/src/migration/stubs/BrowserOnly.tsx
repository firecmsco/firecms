import React from "react";

export default function BrowserOnly({ children }: { children: any }) {
  // Always render on server for simplicity; adjust if client-only needed.
  return <>{typeof children === 'function' ? children() : children}</>;
}

