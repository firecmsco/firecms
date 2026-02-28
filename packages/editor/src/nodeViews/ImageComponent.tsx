import React from "react";
import { ReactNodeViewProps } from "./ReactNodeView";
import { cls, defaultBorderMixin } from "@firecms/ui";

export const ImageComponent: React.FC<ReactNodeViewProps> = ({ node, view, getPos }) => {
    // If the node is selected
    const selected = view.state.selection.from === getPos();

    return (
        <img
            src={node.attrs.src}
            alt={node.attrs.alt || ""}
            title={node.attrs.title || ""}
            className={cls(
                "rounded-lg border border-solid border-gray-200 dark:border-gray-800 max-w-full",
                selected ? "ring-2 ring-primary border-primary" : ""
            )}
        />
    );
};
