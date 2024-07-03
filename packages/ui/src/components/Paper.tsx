import React from "react";

import { paperMixin } from "../styles";
import { cls } from "../util";

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
