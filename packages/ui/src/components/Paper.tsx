import React from "react";

import { paperMixin } from "../styles.js";
import { cls } from "../util/index.js";

export function Paper({
                          children,
                          style,
                          className,
                      }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;

}) {
    return (
        <div
            className={cls(paperMixin, className)}
            style={style}>
            {children}
        </div>
    )
}
