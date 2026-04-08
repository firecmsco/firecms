import { forwardRef, type ReactNode, useEffect, useRef, useState } from "react";
import { useProseMirrorContext } from "../hooks/useProseMirrorContext";
import { autoUpdate, computePosition, flip, offset, shift, type VirtualElement } from "@floating-ui/dom";
import { NodeSelection } from "prosemirror-state";

export interface EditorBubbleProps {
    children: ReactNode;
    options?: any;
    className?: string;
}

export const EditorBubble = forwardRef<HTMLDivElement, EditorBubbleProps>(
    ({ children, options, className }, ref) => {
        const { view, state } = useProseMirrorContext();
        const menuRef = useRef<HTMLDivElement>(null);
        const [show, setShow] = useState(false);

        useEffect(() => {
            if (!view || !state) return;

            // Delay evaluation slightly to let selection settle
            const timer = setTimeout(() => {
                const { selection } = state;
                const { empty } = selection;

                // check if image is selected
                let isImage = false;
                state.doc.nodesBetween(selection.from, selection.to, (node) => {
                    if (node.type.name === "image") isImage = true;
                });

                if (isImage || empty || selection instanceof NodeSelection) {
                    setShow(false);
                    return;
                }

                setShow(true);
            }, 0);

            return () => clearTimeout(timer);
        }, [view, state]);

        useEffect(() => {
            if (!show || !view || !state || !menuRef.current) return;

            const { from, to } = state.selection;

            // Fallback for end selection coords
            let start = view.coordsAtPos(from);
            let end = view.coordsAtPos(to);

            const virtualEl = {
                getBoundingClientRect() {
                    const top = Math.min(start.top, end.top);
                    const bottom = Math.max(start.bottom, end.bottom);
                    const left = Math.min(start.left, end.left);
                    const right = Math.max(start.right, end.right);
                    return {
                        width: right - left,
                        height: bottom - top,
                        x: left,
                        y: top,
                        top,
                        left,
                        right,
                        bottom,
                    };
                }
            };

            const cleanup = autoUpdate(virtualEl as VirtualElement, menuRef.current, () => {
                if (!menuRef.current) return;

                // Recompute coords in case of scroll
                try {
                    start = view.coordsAtPos(state.selection.from);
                    end = view.coordsAtPos(state.selection.to);
                } catch (e) {
                    // Ignore error if selection is out of bounds
                }

                computePosition(virtualEl as VirtualElement, menuRef.current, {
                    placement: options?.placement || "top",
                    middleware: [offset(options?.offset || 8), flip(), shift()],
                    strategy: "fixed"
                }).then(({ x, y }) => {
                    if (menuRef.current) {
                        Object.assign(menuRef.current.style, {
                            left: `${x}px`,
                            top: `${y}px`,
                            visibility: "visible",
                        });
                    }
                });
            });
            return () => cleanup();
        }, [show, view, state, options]);

        if (!show) return null;

        return (
            <div
                ref={menuRef}
                className={className}
                style={{ position: "fixed", zIndex: 9999, visibility: "hidden" }}
                onMouseDown={(e) => {
                    e.preventDefault(); // Don't lose focus inside ProseMirror
                }}
            >
                {children}
            </div>
        );
    }
);

EditorBubble.displayName = "EditorBubble";

export default EditorBubble;
