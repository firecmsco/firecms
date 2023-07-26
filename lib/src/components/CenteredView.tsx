import React from "react";

export function CenteredView({
                                 children,
                                 maxWidth,
                                 fullScreen = false,
                                 fadeTimeout = 800
                             }: {
    children: React.ReactNode;
    maxWidth?: number | string;
    fullScreen?: boolean,
    fadeTimeout?: number
}) {

    return (
        <div
            className={`flex flex-col items-center ${fullScreen ? "h-screen" : "h-full"} ${!maxWidth ? "justify-center" : ""} max-h-full space-y-2 p-2`}
        >
            {maxWidth &&
                <div className="w-full mx-auto" style={{ maxWidth }}>
                    {children}
                </div>}

            {!maxWidth && children}
        </div>
    );

}
