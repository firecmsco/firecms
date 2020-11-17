import React, { useEffect } from "react";
import { Grow } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import clsx from "clsx";

const useStyles = makeStyles<Theme>((theme: Theme) =>
    createStyles({
        popup: {
            display: "inline-block",
            userSelect: "none",
            position: "fixed",
            zIndex: 1300,
            boxShadow: "0 0 0 2px rgba(0,0,0,0.1)",
            borderRadius: "6px",
            backgroundColor: "#f9f9f9",
            padding: theme.spacing(2)
        },
        hidden: {
            visibility: "hidden",
            zIndex: -1
        }
    }));


type DraggableProps = {
    children: React.ReactNode;
    x?: number;
    y?: number;
    open: boolean;
    onMove: (x: number, y: number) => void,
    onMeasure: (rect: DOMRect | undefined) => void,
};

export function Draggable({
                              children,
                              x,
                              y,
                              open,
                              onMove,
                              onMeasure
                          }: DraggableProps) {

    const classes = useStyles();

    let relX = 0;
    let relY = 0;

    const ref = React.createRef<HTMLDivElement>();

    useEffect(
        () => {
            onMeasure(ref.current?.getBoundingClientRect());
        },
        [ref.current]
    );

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
        if (ref.current) {
            ref.current.style.top = `${y}px`;
            ref.current.style.left = `${x}px`;
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

    const element = (
        <div key={`table_popup_${open}`}
             className={clsx(classes.popup,
                 {
                     [classes.hidden]: !open
                 })} ref={ref}>
            {children}
        </div>
    );

    if (!open)
        return element;

    return (
        <Grow in={open}>
            {element}
        </Grow>
    );
}
