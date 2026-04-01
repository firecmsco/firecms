import { forwardRef, useEffect, useRef, useState } from "react";
import { useProseMirrorContext } from "../hooks/useProseMirrorContext";
import { autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";
import { NodeSelection } from "prosemirror-state";
import { TextField, defaultBorderMixin, Typography, cls } from "@rebasepro/ui";
import { useTranslation } from "../../hooks";

export interface ImageBubbleProps {
    options?: any;
    className?: string;
}

export const ImageBubble = forwardRef<HTMLDivElement, ImageBubbleProps>(
    ({ options, className }, ref) => {
        const { view, state } = useProseMirrorContext();
        const { t } = useTranslation();
        const menuRef = useRef<HTMLDivElement>(null);
        const [show, setShow] = useState(false);
        const [alt, setAlt] = useState("");
        const [title, setTitle] = useState("");
        const [imagePos, setImagePos] = useState<number | null>(null);

        useEffect(() => {
            if (!view) return;
            const handleContextMenu = (e: MouseEvent) => {
                const posInfo = view.posAtCoords({ left: e.clientX, top: e.clientY });
                if (posInfo && posInfo.inside >= 0) {
                    const node = view.state.doc.nodeAt(posInfo.inside);
                    if (node && node.type.name === "image") {
                        e.preventDefault();
                        const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, posInfo.inside));
                        view.dispatch(tr);
                        setShow(true);
                        setAlt(node.attrs.alt || "");
                        setTitle(node.attrs.title || "");
                        setImagePos(posInfo.inside);
                    }
                }
            };
            view.dom.addEventListener("contextmenu", handleContextMenu);
            
            const handleMousedown = (e: MouseEvent) => {
                if (menuRef.current && !menuRef.current.contains(e.target as Node) && e.button !== 2) {
                    setShow(false);
                }
            };
            document.addEventListener("mousedown", handleMousedown);
            
            return () => {
                view.dom.removeEventListener("contextmenu", handleContextMenu);
                document.removeEventListener("mousedown", handleMousedown);
            };
        }, [view]);

        useEffect(() => {
            if (!show || !view || !state || !menuRef.current) return;

            const { from, to } = state.selection;
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

            const cleanup = autoUpdate(virtualEl as any, menuRef.current, () => {
                if (!menuRef.current) return;
                try {
                    start = view.coordsAtPos(state.selection.from);
                    end = view.coordsAtPos(state.selection.to);
                } catch (e) {}

                computePosition(virtualEl as any, menuRef.current, {
                    placement: options?.placement || "bottom",
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

        const handleSave = (newAlt: string, newTitle: string) => {
            if (imagePos !== null && view) {
                const node = view.state.doc.nodeAt(imagePos);
                if (node && node.type.name === "image") {
                    const tr = view.state.tr.setNodeMarkup(imagePos, undefined, {
                        ...node.attrs,
                        alt: newAlt,
                        title: newTitle
                    });
                    // Preserve the node selection so the bubble stays open!
                    tr.setSelection(NodeSelection.create(tr.doc, imagePos));
                    view.dispatch(tr);
                }
            }
        };

        if (!show) return null;

        return (
            <div
                ref={menuRef}
                style={{ visibility: "hidden", position: "fixed", zIndex: 50 }}
                className={cls("flex flex-col gap-1.5 p-2 w-56 max-w-[90vw] rounded-lg border bg-white dark:bg-surface-900 shadow-lg", defaultBorderMixin, className)}
                onMouseDown={(e) => {
                    // Prevent mousedown from stealing focus from inputs
                    // but we don't want to prevent typing
                    // Only prevent if clicking on the container background
                    if (e.target === e.currentTarget) {
                        e.preventDefault();
                    }
                }}
            >
                <TextField
                    size={"small"}
                    placeholder={t("alt_text")}
                    value={alt}
                    onChange={(e: any) => {
                        setAlt(e.target.value);
                        handleSave(e.target.value, title);
                    }}
                />
                <TextField
                    size={"small"}
                    placeholder={t("title")}
                    value={title}
                    onChange={(e: any) => {
                        setTitle(e.target.value);
                        handleSave(alt, e.target.value);
                    }}
                />
            </div>
        );
    }
);
