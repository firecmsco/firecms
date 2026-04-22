import React from "react";

import { IconProps } from "./Icon";

const sizeMap: Record<string, number> = {
    smallest: 16,
    small: 20,
    medium: 24,
    large: 28,
};

/**
 * Firebase Firestore flame icon (monochrome, uses currentColor).
 * @group Icons
 */
export function FirestoreIcon(props: IconProps) {
    const s = typeof props.size === "number"
        ? props.size
        : sizeMap[props.size ?? "medium"] ?? 24;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={props.className}
            fill={"currentColor"}
            width={s}
            height={s}
            viewBox="0 0 73 91"
        >
            <path
                d="M22.575 87.933A52.16 52.16 0 0034.787 90.513c5.84.204 11.395-1.004 16.359-3.298a70.68 70.68 0 01-15.948-10.013c-2.98 4.778-7.393 8.548-12.623 10.731z"
                opacity=".7"
            />
            <path
                d="M35.2 77.205c-10.505-9.714-16.878-23.776-16.339-39.2.018-.499.045-1.001.075-1.5a39.51 39.51 0 00-5.866-.855 38.77 38.77 0 00-8.34.997A53.07 53.07 0 00.022 53.236c-.544 15.58 8.884 29.191 22.553 34.697 5.23-2.18 9.642-5.948 12.625-10.728z"
                opacity=".6"
            />
            <path
                d="M35.2 77.205a31.63 31.63 0 004.096-13.428c.452-12.985-8.278-24.155-20.36-27.273-.03.5-.058 1.002-.076 1.502-.536 15.421 5.835 29.483 16.34 39.199z"
                opacity=".7"
            />
            <path
                d="M37.944 0a73.99 73.99 0 00-15.603 21.156 72.82 72.82 0 00-3.41 15.349c12.082 3.117 20.812 14.288 20.36 27.275a31.58 31.58 0 01-4.098 13.425 70.76 70.76 0 0015.948 10.013c11.951-5.523 20.43-17.41 20.919-31.467.318-9.11-3.181-17.228-8.126-24.081C58.711 24.424 37.944 0 37.944 0z"
            />
        </svg>
    );
}
