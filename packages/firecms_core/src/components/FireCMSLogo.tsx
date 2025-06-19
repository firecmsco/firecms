import React from "react";

export function FireCMSLogo({
                                width,
                                height,
                                className,
                                style
                            }: {
    width?: string,
    height?: string,
    className?: string,
    style?: React.CSSProperties
}) {
    return (
        <svg
            width={width ?? "100%"} height={height ?? "100%"}
            version="1.1"
            style={style}
            className={className}
            viewBox="0 0 583 583" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="291.5" cy="291.5" r="291.5" fill="#0070F4"/>
            <ellipse cx="292" cy="291.5" rx="173" ry="173.5" fill="#FF3773"/>
            <path
                d="M465 291.5C465 268.847 460.525 246.416 451.831 225.487C443.137 204.558 430.394 185.542 414.329 169.524C398.265 153.506 379.194 140.8 358.204 132.131C337.215 123.462 314.719 119 292 119C269.281 119 246.785 123.462 225.796 132.131C204.806 140.8 185.735 153.506 169.671 169.524C153.606 185.542 140.863 204.558 132.169 225.487C123.475 246.416 119 268.847 119 291.5L292 291.5H465Z"
                fill="#FFA400"/>
        </svg>
    );

}
