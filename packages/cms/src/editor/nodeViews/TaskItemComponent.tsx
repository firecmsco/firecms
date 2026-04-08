import React from "react";
import { ReactNodeViewProps } from "./ReactNodeView";

export const TaskItemComponent: React.FC<ReactNodeViewProps> = ({ node, view, getPos }) => {
    const checked = node.attrs.checked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pos = getPos();
        if (typeof pos !== "number") return;

        view.dispatch(
            view.state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                checked: e.target.checked
            })
        );
    };

    return (
        <label contentEditable={false} className="flex items-start select-none px-1">
            <input
                type="checkbox"
                checked={checked}
                onChange={handleChange}
                className="mt-1 flex-shrink-0 cursor-pointer"
            />
        </label>
    );
};
