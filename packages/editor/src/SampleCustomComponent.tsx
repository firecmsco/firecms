import React, { useEffect, useState } from "react";
import { Editor, NodeViewWrapper } from "@tiptap/react";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";

export interface CustomBlockComponentProps {
    node: ProseMirrorNode;
    updateAttributes: (attrs: Record<string, any>) => void;
    getPos: () => number;
    editor: Editor;
}

export const CustomComponent: React.FC<CustomBlockComponentProps> = (props) => {

    const {
        node,
        updateAttributes
    } = props;

    const [value, setValue] = useState<string>(node.attrs.content || "");

    // Update local state when node attrs change (e.g., when undo/redo)
    useEffect(() => {
        setValue(node.attrs.content || "");
    }, [node.attrs.content]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = event.target.value;
        setValue(newValue);
        updateAttributes({ content: newValue });
    };

    return (
        <NodeViewWrapper className="custom-component">
            <textarea value={value} onChange={handleChange}/>
        </NodeViewWrapper>
    );
};
