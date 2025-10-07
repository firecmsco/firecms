import React from "react";

interface LayoutProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div id="__docusaurus">
      <div className="main-wrapper">{children}</div>
    </div>
  );
}
