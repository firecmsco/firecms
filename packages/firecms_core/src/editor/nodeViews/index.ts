import { Node as ProseMirrorNode } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import { ReactNodeView, ReactNodeViewComponent } from "./ReactNodeView";
import { TaskItemComponent } from "./TaskItemComponent";
import { ImageComponent } from "./ImageComponent";

function createReactNodeView(
    Component: ReactNodeViewComponent,
    as: string = "div",
    className?: string,
    createContentDOM?: () => HTMLElement
) {
    return (node: ProseMirrorNode, view: EditorView, getPos: () => number | undefined): NodeView => {
        const contentDOM = createContentDOM ? createContentDOM() : undefined;
        return new ReactNodeView(node, view, getPos, Component, as, className, contentDOM);
    };
}

export const nodeViews = {
    task_item: createReactNodeView(
        TaskItemComponent,
        "li",
        "flex items-start",
        () => {
            const dom = document.createElement("div");
            dom.className = "flex-grow min-w-0";
            return dom;
        }
    ),
    image: createReactNodeView(
        ImageComponent,
        "span",
        "inline-block w-full"
    )
};
