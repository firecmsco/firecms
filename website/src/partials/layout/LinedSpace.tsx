import React from "react";

import clsx from "clsx";
import { defaultBorderMixin } from "../styles";

export function LinedSpace({ position = "bottom" }: { position?: "top" | "bottom" }) {

    return (
        <div className={clsx("h-8 border-0",
            position === "top" ? "border-t" : "border-b",
            defaultBorderMixin)}/>
    )
}
