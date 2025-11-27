import React from "react";

export type CodeSampleProps = {
    children: React.ReactNode;
    className?: string;
}

export default function CodeSample({
                                       children,
                                       className
                                   }: CodeSampleProps) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}
