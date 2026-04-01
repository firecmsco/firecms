import React from "react";
import { ReactNodeViewProps } from "./ReactNodeView";
import { cls, defaultBorderMixin } from "@rebasepro/ui";

export const ImageComponent: React.FC<ReactNodeViewProps> = ({ node, view, getPos }) => {
    // If the node is selected
    const selected = view.state.selection.from === getPos();

    return (
        <img
            src={node.attrs.src}
            alt={node.attrs.alt || ""}
            title={node.attrs.title || ""}
            className={cls(
                "rounded-lg max-w-full !m-0",
                selected ? "" : ""
            )}
        />
    );
};
