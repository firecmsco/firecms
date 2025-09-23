import React from "react";

/**
 * @group Preview components
 */
export function EmptyValue({ className }: { className?: string }) {

    return <div
        className={"rounded-full bg-surface-200/30 w-5 h-2 inline-block " + className}/>;
}
