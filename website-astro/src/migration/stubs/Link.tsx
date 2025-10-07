import React from "react";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  href?: string;
}

export default function Link({ to, href, children, ...rest }: LinkProps) {
  const finalHref = href || to || '#';
  return <a href={finalHref} {...rest}>{children}</a>;
}

