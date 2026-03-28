import { forwardRef, useEffect, useRef, useState } from "react";
import { useProseMirrorContext } from "../hooks/useProseMirrorContext";
import { autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";
import { IconButton, Tooltip, defaultBorderMixin, cls } from "@firecms/ui";
import {
    addColumnBefore,
    addColumnAfter,
    deleteColumn,
    addRowBefore,
    addRowAfter,
    deleteRow,
    deleteTable,
} from "prosemirror-tables";
import { EditorState } from "prosemirror-state";


export interface TableBubbleProps {
    options?: any;
    className?: string;
}

const isSelectionInTable = (state: EditorState) => {
    const { $from } = state.selection;
    for (let d = $from.depth; d > 0; d--) {
        if ($from.node(d).type.name === "table") {
            return true;
        }
    }
    return false;
};

// We create separate icon components if they don't exist in @firecms/ui
// using basic SVGs for now, or we can use existing ones if we know them.
// Wait, I will use generic SVGs for these since I don't know if @firecms/ui has them.

export const TableBubble = forwardRef<HTMLDivElement, TableBubbleProps>(
    ({ options, className }, ref) => {
        const { view, state } = useProseMirrorContext();
        const menuRef = useRef<HTMLDivElement>(null);
        const [show, setShow] = useState(false);

        useEffect(() => {
            if (!state) return;
            setShow(isSelectionInTable(state));
        }, [state?.selection]);

        useEffect(() => {
            if (!show || !view || !state || !menuRef.current) return;

            const { from, to } = state.selection;
            
            // Safety measure: if view.docView is destroyed, coordsAtPos might crash
            if (view.isDestroyed) return;

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
                        bottom,
                        left,
                        right,
                    } as DOMRect;
                },
            };

            const cleanup = autoUpdate(virtualEl as any, menuRef.current, () => {
                if (!menuRef.current || view.isDestroyed) return;
                try {
                    start = view.coordsAtPos(state.selection.from);
                    end = view.coordsAtPos(state.selection.to);
                } catch (e) {
                    // Ignore errors during fast remounts/updates
                }

                computePosition(virtualEl as any, menuRef.current, {
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

        if (!show || !view || !state) return null;

        const executeCommand = (cmd: any) => {
            cmd(state, view.dispatch);
            view.focus();
        };

        return (
            <div
                ref={menuRef}
                style={{ visibility: "hidden", position: "fixed", zIndex: 50 }}
                className={cls("flex flex-row gap-1 p-1 rounded-lg border bg-white dark:bg-surface-900 shadow-lg", defaultBorderMixin, className)}
                onMouseDown={(e) => {
                    // Prevent mousedown from stealing focus from the editor
                    e.preventDefault();
                }}
            >
                <div className="flex gap-1 border-r pr-1 mr-1 dark:border-gray-700">
                    <Tooltip title="Add row before">
                        <IconButton size="small" onClick={() => executeCommand(addRowBefore)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line><line x1="3" y1="9" x2="21" y2="9"></line></svg>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Add row after">
                        <IconButton size="small" onClick={() => executeCommand(addRowAfter)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="12" x2="12" y2="20"></line><line x1="8" y1="16" x2="16" y2="16"></line><line x1="3" y1="15" x2="21" y2="15"></line></svg>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete row">
                        <IconButton size="small" onClick={() => executeCommand(deleteRow)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="12" x2="21" y2="12"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                        </IconButton>
                    </Tooltip>
                </div>
                
                <div className="flex gap-1 border-r pr-1 mr-1 dark:border-gray-700">
                    <Tooltip title="Add column before">
                        <IconButton size="small" onClick={() => executeCommand(addColumnBefore)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line><line x1="12" y1="8" x2="12" y2="16"></line><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Add column after">
                        <IconButton size="small" onClick={() => executeCommand(addColumnAfter)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="12" x2="20" y2="12"></line><line x1="16" y1="8" x2="16" y2="16"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete column">
                        <IconButton size="small" onClick={() => executeCommand(deleteColumn)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line><line x1="12" y1="8" x2="12" y2="16"></line></svg>
                        </IconButton>
                    </Tooltip>
                </div>

                <Tooltip title="Delete table">
                    <IconButton size="small" onClick={() => executeCommand(deleteTable)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </IconButton>
                </Tooltip>
            </div>
        );
    }
);
