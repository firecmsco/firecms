import React, { useEffect } from "react";

interface SiteLayoutProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Lightweight replacement for Docusaurus Layout.
 * Sets document.title (client-side) and provides a wrapper div.
 */
export default function Layout({ title, children }: SiteLayoutProps) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
  return <div className="site-layout">{children}</div>;
}

