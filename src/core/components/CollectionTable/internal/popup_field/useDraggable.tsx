import React, { useEffect } from "react";

interface DraggableProps {
    containerRef: React.RefObject<HTMLDivElement>,
    ref: React.RefObject<HTMLDivElement>,
    x?: number;
    y?: number;
    onMove: (x: number, y: number) => void,
}

export function useDraggable({
                                 containerRef,
                                 ref,
                                 x,
                                 y,
                                 onMove
                             }: DraggableProps) {


    let relX = 0;
    let relY = 0;


    const onMouseDown = (event: any) => {
        if (event.button !== 0 || !ref.current || event.target !== ref.current) {
            return;
        }

        const { x, y } = ref.current.getBoundingClientRect();

        relX = event.screenX - x;
        relY = event.screenY - y;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        event.stopPropagation();
    };

    const onMouseUp = (event: any) => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        event.stopPropagation();
    };

    const onMouseMove = (event: any) => {
        onMove(
            event.screenX - relX,
            event.screenY - relY
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
        if (ref.current)
            ref.current.addEventListener("mousedown", onMouseDown);
        update();
        return () => {
            if (ref.current)
                ref.current.removeEventListener("mousedown", onMouseDown);
        };
    });

}
