import React, { ReactNode } from "react";
import { createRoot, Root } from "react-dom/client";
import { Node as ProseMirrorNode } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";

export interface ReactNodeViewProps {
    node: ProseMirrorNode;
    view: EditorView;
    getPos: () => number | undefined;
}

export type ReactNodeViewComponent = React.FC<ReactNodeViewProps>;

/**
 * A utility class that implements the ProseMirror NodeView interface but delegates rendering
 * to a React component.
 * Note: This uses createRoot, so it does not automatically inherit React Contexts.
 * If contexts are needed, wrap them manually or use a portal-based approach instead.
 */
export class ReactNodeView implements NodeView {
    public node: ProseMirrorNode;
    public view: EditorView;
    public getPos: () => number | undefined;
    public dom: HTMLElement;
    public contentDOM?: HTMLElement;
    private root: Root;
    private Component: ReactNodeViewComponent;

    constructor(
        node: ProseMirrorNode,
        view: EditorView,
        getPos: () => number | undefined,
        Component: ReactNodeViewComponent,
        as: string = "div",
        className?: string,
        contentDOMElement?: HTMLElement
    ) {
        this.node = node;
        this.view = view;
        this.getPos = getPos;
        this.Component = Component;

        this.dom = document.createElement(as);
        if (className) this.dom.className = className;
        if (contentDOMElement) {
            this.contentDOM = contentDOMElement;
        }

        const container = document.createElement("div");
        // We render React next to contentDOM
        this.dom.appendChild(container);
        if (this.contentDOM) {
            this.dom.appendChild(this.contentDOM);
        }

        this.root = createRoot(container);
        this.render();
    }

    private render() {
        this.root.render(
            <this.Component
                node={this.node}
                view={this.view}
                getPos={this.getPos}
            />
        );
    }

    update(node: ProseMirrorNode): boolean {
        if (node.type !== this.node.type) {
            return false;
        }
        this.node = node;
        this.render();
        return true;
    }

    destroy() {
        this.root.unmount();
    }

    ignoreMutation(mutation: any) {
        if (!this.contentDOM) {
            return true;
        }
        return !this.contentDOM.contains(mutation.target);
    }
}
