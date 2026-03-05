import React, { useCallback, useEffect, useRef, useState } from "react";
import { cls } from "../util";
import { defaultBorderMixin } from "../styles";

export type ResizablePanelsProps = {
    firstPanel: React.ReactNode;
    secondPanel: React.ReactNode;
    /** Whether the first panel is visible (e.g. Sidebar) */
    showFirstPanel?: boolean;
    /** Whether the second panel is visible (e.g. Results) */
    showSecondPanel?: boolean;
    /** 0-100 representing the width/height of the first panel */
    panelSizePercent: number;
    onPanelSizeChange: (sizePercent: number) => void;
    minPanelSizePx?: number;
    orientation?: 'horizontal' | 'vertical';
    className?: string;
};

export function ResizablePanels({
    firstPanel,
    secondPanel,
    showFirstPanel = true,
    showSecondPanel = true,
    panelSizePercent,
    onPanelSizeChange,
    minPanelSizePx = 200,
    orientation = 'horizontal',
    className
}: ResizablePanelsProps) {

    const containerRef = useRef<HTMLDivElement>(null);
    const isResizingRef = useRef(false);

    // For local layout tracking without triggering React rerenders during drag
    const firstPanelRef = useRef<HTMLDivElement>(null);
    const startPosRef = useRef(0);
    const startSizeRef = useRef(0);

    const [isResizing, setIsResizing] = useState(false);
    const isHorizontal = orientation === 'horizontal';

    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        if (!showFirstPanel || !showSecondPanel) return;

        e.preventDefault();
        isResizingRef.current = true;
        setIsResizing(true);

        startPosRef.current = isHorizontal ? e.clientX : e.clientY;

        if (firstPanelRef.current) {
            const rect = firstPanelRef.current.getBoundingClientRect();
            startSizeRef.current = isHorizontal ? rect.width : rect.height;
        }

        document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none';
    }, [isHorizontal, showFirstPanel, showSecondPanel]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingRef.current || !containerRef.current) return;

            const currentPos = isHorizontal ? e.clientX : e.clientY;
            const delta = currentPos - startPosRef.current; // Dragging right/down increases first panel size

            let newSize = startSizeRef.current + delta;

            const containerRect = containerRef.current.getBoundingClientRect();
            const containerTotal = isHorizontal ? containerRect.width : containerRect.height;

            // Limit the maximum size to prevent pushing the second panel offscreen
            const maxSize = containerTotal - minPanelSizePx;

            newSize = Math.max(minPanelSizePx, Math.min(newSize, maxSize));

            // Directly update the DOM for performance while dragging
            if (firstPanelRef.current) {
                firstPanelRef.current.style.flexBasis = `${newSize}px`;
            }
        };

        const handleMouseUp = () => {
            if (isResizingRef.current && containerRef.current && firstPanelRef.current) {
                isResizingRef.current = false;
                setIsResizing(false);
                document.body.style.cursor = "";
                document.body.style.userSelect = "";

                // Calculate the final percentage and notify parent
                const containerRect = containerRef.current.getBoundingClientRect();
                const firstPanelRect = firstPanelRef.current.getBoundingClientRect();

                const containerSize = isHorizontal ? containerRect.width : containerRect.height;
                const finalSize = isHorizontal ? firstPanelRect.width : firstPanelRect.height;

                if (containerSize > 0) {
                    const newPercent = (finalSize / containerSize) * 100;
                    onPanelSizeChange(Math.max(0, Math.min(100, newPercent)));
                }
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [onPanelSizeChange, isHorizontal, minPanelSizePx]);

    // Calculate applied size
    const appliedBasis = !showFirstPanel ? "0%" : (showSecondPanel ? `${panelSizePercent}%` : "100%");

    return (
        <div
            ref={containerRef}
            className={cls(
                "relative w-full h-full flex overflow-hidden",
                isHorizontal ? "flex-row" : "flex-col",
                className
            )}
        >
            {/* First Panel */}
            <div
                ref={firstPanelRef}
                className={cls(
                    "relative flex-shrink-0 flex flex-col overflow-hidden",
                    !isResizing && "transition-[flex-basis] duration-300 ease-in-out",
                    !showFirstPanel && "hidden"
                )}
                style={{
                    flexBasis: appliedBasis,
                    minWidth: isHorizontal && showFirstPanel && showSecondPanel ? `${minPanelSizePx}px` : undefined,
                    minHeight: !isHorizontal && showFirstPanel && showSecondPanel ? `${minPanelSizePx}px` : undefined,
                    maxWidth: showSecondPanel ? undefined : "100%",
                    maxHeight: showSecondPanel ? undefined : "100%",
                }}
            >
                {firstPanel}
            </div>

            {/* Divider */}
            {showFirstPanel && showSecondPanel && (
                <div
                    className={cls(
                        "relative z-10 flex flex-shrink-0 items-center justify-center",
                        defaultBorderMixin,
                        isHorizontal ? "border-l w-px h-full cursor-col-resize" : "border-t h-px w-full cursor-row-resize"
                    )}
                    onMouseDown={handleResizeStart}
                >
                    {/* Transparent Hit Area with Pill inside */}
                    <div className={cls(
                        "absolute flex items-center justify-center group",
                        isHorizontal ? "w-4 h-full cursor-col-resize top-0" : "h-4 w-full cursor-row-resize left-0"
                    )}>
                        <div className={cls(
                            "bg-primary/60 dark:bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200",
                            isHorizontal ? "w-1 h-8" : "h-1 w-8"
                        )} />
                    </div>
                </div>
            )}

            {/* Second Panel */}
            <div
                className={cls(
                    "flex-grow relative flex flex-col overflow-hidden min-w-0 min-h-0",
                    !showSecondPanel && "hidden"
                )}
            >
                {secondPanel}
            </div>
        </div>
    );
}
