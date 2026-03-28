import { NodeSelection, Plugin } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Slice } from "prosemirror-model";
import { serializeForClipboard } from "./clipboard";

export interface DragHandleOptions {
    /**
     * The width of the drag handle
     */
    dragHandleWidth: number;
}

function absoluteRect(element: Element) {
    const data = element.getBoundingClientRect();

    let ancestor = element.parentElement;
    while (ancestor && window.getComputedStyle(ancestor).position === "static") {
        ancestor = ancestor.parentElement;
    }
    const ancestorRect = ancestor?.getBoundingClientRect();

    return {
        top: data.top - (ancestorRect?.top ?? 0),
        left: data.left - (ancestorRect?.left ?? 0),
        width: data.width
    };
}

function nodeDOMAtCoords(coords: { x: number; y: number }, view: EditorView) {
    const editorRect = view.dom.getBoundingClientRect();

    // 0. Give up if outside vertical bounds or too far horizontally
    if (coords.y < editorRect.top || coords.y > editorRect.bottom) return undefined;
    if (coords.x < editorRect.left - 100 || coords.x > editorRect.right + 50) return undefined;

    // 1. First probe exactly at the mouse coordinates
    let elem = document.elementFromPoint(coords.x, coords.y);
    let block = elem?.closest('li, p:not(:first-child), pre, blockquote, h1, h2, h3, h4, h5, h6, img, [data-type="taskList"]');
    if (block && view.dom.contains(block)) {
        return block.closest('li') || block;
    }

    // 2. If mouse is in the left gutter, probe horizontally into the editor
    const probeX = editorRect.left + Math.min(60, editorRect.width / 4);
    if (coords.x > probeX) return undefined;

    let probeElem = document.elementFromPoint(probeX, coords.y);
    let probeBlock = probeElem?.closest('li, p:not(:first-child), pre, blockquote, h1, h2, h3, h4, h5, h6, img, [data-type="taskList"]');
    if (probeBlock) {
        // Ensure the found block is actually inside our editor
        if (view.dom.contains(probeBlock)) {
            return probeBlock.closest('li') || probeBlock;
        }
    }

    return undefined;
}

function nodePosAtDOM(node: Element, view: EditorView, options: DragHandleOptions) {
    try {
        if (!view.dom.contains(node)) return null;
        const pos = view.posAtDOM(node, 0);
        const $pos = view.state.doc.resolve(pos);
        // posAtDOM(node, 0) generally returns the position inside the node.
        // We want the position right before the node to create a NodeSelection.
        if ($pos.depth > 0) {
            return $pos.before();
        }
        return pos;
    } catch (e) {
        return null;
    }
}

export function dragHandlePlugin(options: DragHandleOptions = { dragHandleWidth: 24 }) {
    function handleDragStart(event: DragEvent, view: EditorView) {
        view.focus();

        if (!event.dataTransfer) return;

        const node = nodeDOMAtCoords({
            x: event.clientX,
            y: event.clientY
        }, view);

        if (!(node instanceof Element)) return;

        const nodePos = nodePosAtDOM(node, view, options);
        if (nodePos == null || nodePos < 0) return;

        const draggedNodeSelection = NodeSelection.create(view.state.doc, nodePos);
        view.dispatch(view.state.tr.setSelection(draggedNodeSelection));

        const slice = view.state.selection.content();
        const {
            dom,
            text
        } = serializeForClipboard(view as any, slice);

        event.dataTransfer.clearData();
        event.dataTransfer.setData("text/html", dom.innerHTML);
        event.dataTransfer.setData("text/plain", text);
        event.dataTransfer.effectAllowed = "copyMove";

        event.dataTransfer.setDragImage(node, 0, 0);

        (view as any).dragging = {
            slice,
            move: true,
            node: draggedNodeSelection
        } as { slice: Slice, move: boolean, node: NodeSelection };
    }

    function handleClick(event: MouseEvent, view: EditorView) {
        view.focus();

        view.dom.classList.remove("dragging");

        const node = nodeDOMAtCoords({
            x: event.clientX,
            y: event.clientY
        }, view);

        if (!(node instanceof Element)) return;

        const nodePos = nodePosAtDOM(node, view, options);
        if (!nodePos) return;

        view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePos)));
    }

    let dragHandleElement: HTMLElement | null = null;

    function hideDragHandle() {
        if (dragHandleElement) {
            dragHandleElement.classList.add("hide");
        }
    }

    function showDragHandle() {
        if (dragHandleElement) {
            dragHandleElement.classList.remove("hide");
        }
    }

    return new Plugin({
        view: (view) => {
            dragHandleElement = document.createElement("div");
            dragHandleElement.draggable = true;
            dragHandleElement.dataset.dragHandle = "";
            dragHandleElement.classList.add("drag-handle");
            dragHandleElement.addEventListener("dragstart", (e) => {
                handleDragStart(e, view as any);
            });
            dragHandleElement.addEventListener("click", (e) => {
                handleClick(e, view as any);
            });
            const onMouseMove = (event: MouseEvent) => {
                if (!view.editable) {
                    return;
                }

                const node = nodeDOMAtCoords({
                    x: event.clientX,
                    y: event.clientY
                }, view);

                if (!(node instanceof Element)) {
                    hideDragHandle();
                    return;
                }

                const compStyle = window.getComputedStyle(node);
                const lineHeight = parseInt(compStyle.lineHeight, 10);
                const paddingTop = parseInt(compStyle.paddingTop, 10);

                const rect = absoluteRect(node);
                if (!rect) {
                    hideDragHandle();
                    return;
                }

                rect.top += (lineHeight - 24) / 2;
                rect.top += paddingTop;
                // Li markers
                if (node.matches("ul:not([data-type=taskList]) li, ol li")) {
                    rect.left -= options.dragHandleWidth;
                }
                rect.width = options.dragHandleWidth;

                if (!dragHandleElement) return;

                dragHandleElement.style.left = `${rect.left - rect.width}px`;
                dragHandleElement.style.top = `${rect.top}px`;
                showDragHandle();
            };

            window.addEventListener("mousemove", onMouseMove);

            hideDragHandle();

            view?.dom?.parentElement?.appendChild(dragHandleElement);

            return {
                destroy: () => {
                    window.removeEventListener("mousemove", onMouseMove);
                    dragHandleElement?.remove?.();
                    dragHandleElement = null;
                }
            };
        },
        props: {
            handleDOMEvents: {
                keydown: () => {
                    hideDragHandle();
                },
                mousewheel: () => {
                    hideDragHandle();
                },
                // dragging class is used for CSS
                dragstart: (view) => {
                    view.dom.classList.add("dragging");
                },
                drop: (view) => {
                    view.dom.classList.remove("dragging");
                },
                dragend: (view) => {
                    view.dom.classList.remove("dragging");
                }
            }
        }
    });
}

import { dropPoint } from "prosemirror-transform";

export function globalDragDropPlugin() {
    let dropCursorElement: HTMLElement | null = null;
    let cleanup: (() => void) | null = null;

    function updateDropCursorColor(el: HTMLElement) {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        const varName = isDark ? "--color-surface-accent-300" : "--color-surface-accent-600";
        const color = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        el.style.backgroundColor = color || (isDark ? "#cbd5e1" : "#475569");
    }

    return new Plugin({
        view(editorView) {
            dropCursorElement = document.createElement("div");
            dropCursorElement.className = "prosemirror-dropcursor-block";
            dropCursorElement.style.cssText = "position: absolute; z-index: 50; pointer-events: none; height: 2px;";
            updateDropCursorColor(dropCursorElement);

            // Watch for theme changes
            const observer = new MutationObserver(() => {
                if (dropCursorElement) updateDropCursorColor(dropCursorElement);
            });
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

            const removeCursor = () => {
                if (dropCursorElement && dropCursorElement.parentNode) {
                    dropCursorElement.parentNode.removeChild(dropCursorElement);
                }
            };

            const getBlockInsertionPoint = (event: DragEvent, clampedX: number) => {
                const pos = editorView.posAtCoords({ left: clampedX, top: event.clientY });
                if (!pos) return null;

                let $pos = editorView.state.doc.resolve(pos.pos);

                let blockDepth = 0;
                for (let i = $pos.depth; i > 0; i--) {
                    const name = $pos.node(i).type.name;
                    if (name === "list_item" || name === "taskItem") {
                        blockDepth = i;
                        break;
                    }
                    if ($pos.node(i).isBlock && name !== "bullet_list" && name !== "ordered_list" && name !== "taskList") {
                        blockDepth = i;
                    }
                }

                if (blockDepth === 0) return pos.pos;

                const nodeBeforePos = $pos.before(blockDepth);
                const nodeAfterPos = $pos.after(blockDepth);

                const domNode = editorView.nodeDOM(nodeBeforePos);
                if (domNode instanceof HTMLElement) {
                    const rect = domNode.getBoundingClientRect();
                    const isTopHalf = event.clientY < rect.top + rect.height / 2;
                    return isTopHalf ? nodeBeforePos : nodeAfterPos;
                }
                return pos.pos;
            };

            const handleDragOver = (event: DragEvent) => {
                if (!editorView.editable || !editorView.dragging) return;

                // If it's a native slice drag (no explicitly captured node from our drag handle)
                // then we bail out here and let ProseMirror native drop logic and native dropcursor handle it
                if (!(editorView.dragging as any).node) {
                    removeCursor();
                    return;
                }

                event.preventDefault(); // browser requires this to allow drop

                const editorRect = editorView.dom.getBoundingClientRect();
                const clampedX = Math.max(editorRect.left + 10, Math.min(event.clientX, editorRect.right - 10));

                let target = getBlockInsertionPoint(event, clampedX);
                if (target === null) {
                    removeCursor();
                    return;
                }

                const $pos = editorView.state.doc.resolve(target);

                let rect;
                const before = $pos.nodeBefore;
                const after = $pos.nodeAfter;

                if (before || after) {
                    const nodeDOM = editorView.nodeDOM(target - (before ? before.nodeSize : 0));
                    if (nodeDOM && nodeDOM instanceof HTMLElement) {
                        const nodeRect = nodeDOM.getBoundingClientRect();
                        let top = before ? nodeRect.bottom : nodeRect.top;
                        if (before && after) {
                            const afterDOM = editorView.nodeDOM(target);
                            if (afterDOM && afterDOM instanceof HTMLElement) {
                                top = (top + afterDOM.getBoundingClientRect().top) / 2;
                            }
                        }
                        rect = { left: nodeRect.left, right: nodeRect.right, top: top - 1, bottom: top + 1 };
                    }
                }

                if (!rect) {
                    const coords = editorView.coordsAtPos(target);
                    rect = { left: editorRect.left + 50, right: editorRect.right - 50, top: coords.top - 1, bottom: coords.top + 1 };
                }

                const parent = editorView.dom.offsetParent as HTMLElement;
                let parentLeft = 0;
                let parentTop = 0;
                if (parent && parent !== document.body && getComputedStyle(parent).position !== "static") {
                    const parentRect = parent.getBoundingClientRect();
                    parentLeft = parentRect.left - parent.scrollLeft;
                    parentTop = parentRect.top - parent.scrollTop;
                }

                if (!dropCursorElement!.parentNode) {
                    parent.appendChild(dropCursorElement!);
                }

                dropCursorElement!.style.left = `${rect.left - parentLeft}px`;
                dropCursorElement!.style.top = `${rect.top - parentTop}px`;
                dropCursorElement!.style.width = `${rect.right - rect.left}px`;
            };

            const handleDrop = (event: DragEvent) => {
                if (!editorView.editable || !editorView.dragging) return;

                if (!(editorView.dragging as any).node) {
                    removeCursor();
                    return;
                }

                event.preventDefault();
                removeCursor();
                editorView.dom.classList.remove("dragging");

                const editorRect = editorView.dom.getBoundingClientRect();
                const clampedX = Math.max(editorRect.left + 10, Math.min(event.clientX, editorRect.right - 10));

                let targetPos = getBlockInsertionPoint(event, clampedX);
                if (targetPos === null) return;

                const dragging = (editorView as any).dragging as { slice: Slice, move: boolean, node?: NodeSelection };
                if (dragging && dragging.slice) {
                    let tr = editorView.state.tr;
                    if (dragging.move) {
                        const { node } = dragging;
                        if (node) {
                            node.replace(tr); // exact native ProseMirror delete
                        } else {
                            tr = tr.deleteSelection();
                        }
                    }

                    const mappedTarget = tr.mapping.map(targetPos);
                    const beforeInsert = tr.doc;

                    let { node, slice } = dragging;

                    if (node && node.node) {
                        let nodeToInsert: any = node.node;
                        const $mapped = tr.doc.resolve(mappedTarget);
                        const parentName = $mapped.parent.type.name;

                        const isTargetList = parentName === "bullet_list" || parentName === "ordered_list";
                        const isTargetTaskList = parentName === "taskList";

                        // 1. Unwrap incoming lists if they don't match the destination perfectly
                        if (nodeToInsert.type.name === "list_item" && !isTargetList) {
                            nodeToInsert = nodeToInsert.content;
                        } else if (nodeToInsert.type.name === "taskItem" && !isTargetTaskList) {
                            nodeToInsert = nodeToInsert.content;
                        }

                        // 2. Wrap incoming blocks/fragments into exactly the target list type
                        const isFragment = !nodeToInsert.type;
                        const needsWrap = isFragment || (nodeToInsert.type.name !== "list_item" && nodeToInsert.type.name !== "taskItem");

                        if (needsWrap) {
                            if (isTargetList) {
                                const listItemType = editorView.state.schema.nodes.list_item;
                                if (listItemType) nodeToInsert = listItemType.create(null, nodeToInsert);
                            } else if (isTargetTaskList) {
                                const taskItemType = editorView.state.schema.nodes.taskItem;
                                if (taskItemType) nodeToInsert = taskItemType.create({ checked: false }, nodeToInsert);
                            }
                        }

                        // 3. Force insertion. tr.replace slices and splits lists. tr.insert preserves the explicit boundary.
                        try {
                            tr = tr.insert(mappedTarget, nodeToInsert);
                        } catch (e) {
                            console.warn("Could not insert dragged node exactly at target. Attempting fallback.", e);
                            const point = dropPoint(tr.doc, mappedTarget, slice);
                            if (point !== null) {
                                tr = tr.replace(point, point, slice);
                            }
                        }
                    } else if (slice) {
                        // For generic slices (e.g native image dragging), we MUST use dropPoint
                        // so ProseMirror finds a schema-valid depth to insert the node structure natively.
                        const point = dropPoint(tr.doc, mappedTarget, slice);
                        const finalTarget = point !== null ? point : mappedTarget;
                        tr = tr.replace(finalTarget, finalTarget, slice);
                    }

                    if (!tr.doc.eq(beforeInsert)) {
                        editorView.dispatch(tr.setMeta("uiEvent", "drop"));
                        editorView.focus();
                    }
                }

                (editorView as any).dragging = null;
            };

            const handleDragEnd = () => {
                removeCursor();
            };

            window.addEventListener("dragover", handleDragOver, { capture: true });
            window.addEventListener("drop", handleDrop, { capture: true });
            window.addEventListener("dragend", handleDragEnd, { capture: true });

            cleanup = () => {
                removeCursor();
                observer.disconnect();
                window.removeEventListener("dragover", handleDragOver, { capture: true });
                window.removeEventListener("drop", handleDrop, { capture: true });
                window.removeEventListener("dragend", handleDragEnd, { capture: true });
            };

            return {
                destroy() {
                    if (cleanup) cleanup();
                }
            };
        }
    });
}


