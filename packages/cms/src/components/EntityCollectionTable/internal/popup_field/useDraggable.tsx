import React, { useCallback, useEffect } from "react";

interface DraggableProps {
    containerRef: React.RefObject<HTMLDivElement | null>,
    innerRef: React.RefObject<HTMLDivElement | null>,
    x?: number;
    y?: number;
    onMove: (params: { x: number, y: number }) => void,
}

export function useDraggable({
    containerRef,
    innerRef,
    x,
    y,
    onMove
}: DraggableProps) {

    let relX = 0;
    let relY = 0;

    const listeningRef = React.useRef(false);

    const onMouseDown = useCallback((event: MouseEvent) => {
        if (event.button !== 0 || !containerRef.current || event.defaultPrevented || (event as MouseEvent & { innerClicked?: boolean }).innerClicked) {
            return;
        }

        const {
            x,
            y
        } = containerRef.current.getBoundingClientRect();

        relX = event.screenX - x;
        relY = event.screenY - y;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("selectstart", onSelect);
        listeningRef.current = true;
        // event.stopPropagation();
    }, [containerRef, onMove]);

    const onMouseDownInner = useCallback((event: MouseEvent) => {
        (event as MouseEvent & { innerClicked?: boolean }).innerClicked = true;
    }, [])

    const onSelect = useCallback((event: Event) => {
        event.preventDefault()
        event.stopPropagation();
    }, [])

    const onMouseUp = (event: MouseEvent) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("selectstart", onSelect);
        event.stopPropagation();
        listeningRef.current = false;
    };

    const onMouseMove = (event: MouseEvent) => {
        if ((event.target as HTMLElement)?.localName === "input" || !listeningRef.current)
            return;
        onMove({
            x: event.screenX - relX,
            y: event.screenY - relY
        }
        );
        event.stopPropagation();
    };

    const update = () => {
        if (containerRef.current) {
            containerRef.current.style.top = `${y}px`;
            containerRef.current.style.left = `${x}px`;
        }
    };

    useEffect(() => {
        const current = containerRef.current;
        const innerCurrent = innerRef.current;
        if (!current || !innerCurrent)
            return;
        if (innerCurrent)
            innerCurrent.addEventListener("mousedown", onMouseDownInner);
        if (current)
            current.addEventListener("mousedown", onMouseDown);
        update();
        return () => {
            if (current)
                current.removeEventListener("mousedown", onMouseDown);
            if (innerCurrent)
                innerCurrent.removeEventListener("mousedown", onMouseDownInner);
        };
    }, [containerRef, innerRef, onMouseDownInner, onMouseDown]);

}
