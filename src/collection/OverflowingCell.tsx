import { CollectionSize, EntitySchema } from "../models";
import React, { useCallback, useMemo, useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import Measure, { ContentRect } from "react-measure";
import { getRowHeight } from "./common";
import clsx from "clsx";

const useStyles = makeStyles<Theme, StyleProps>((theme: Theme) =>
    createStyles({
        tableCell: {
            position: "relative",
            overflow: "hidden",
            display: "flex",
            height: "100%",
            width: "100%",
            padding: ({ size }) => {
                switch (size) {
                    case "l":
                    case "xl":
                        return theme.spacing(2);
                    case "m":
                        return theme.spacing(1);
                    case "s":
                        return theme.spacing(0.5);
                    default:
                        return theme.spacing(0.25);
                }
            }
        },
        centered: {
            alignItems: "center"
        },
        faded: {
            "-webkit-mask-image": "linear-gradient(to bottom, black 60%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
            alignItems: "start"
        },
        scrollable: {
            overflow: "auto",
            alignItems: "start"
        },
    })
);

export interface StyleProps {
    size: CollectionSize;
    align: "right" | "left" | "center";
}

interface OverflowingCellProps<S extends EntitySchema> {
    children: React.ReactNode;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    onDoubleClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    allowScroll: boolean;
}

function OverflowingCell<S extends EntitySchema>(
    { children, size, align, onClick, onDoubleClick, allowScroll }: OverflowingCellProps<S> & StyleProps) {

    const classes = useStyles({ size, align });
    const [isOverflowing, setIsOverflowing] = useState<boolean>(false);

    const maxHeight = useMemo(() => getRowHeight(size), [size]);

    const onMeasure = useCallback((contentRect: ContentRect) => {
        if (contentRect?.bounds)
            setIsOverflowing(contentRect.bounds.height > maxHeight);
    }, [maxHeight]);

    return (
        <div className={clsx(
            classes.tableCell,
            {
                [classes.centered]: !isOverflowing,
                [classes.faded]: !allowScroll && isOverflowing,
                [classes.scrollable]: allowScroll && isOverflowing
            })}
             onClick={onClick}
             onDoubleClick={onDoubleClick}>
            <Measure
                bounds
                onResize={onMeasure}
            >
                {({ measureRef }) => (
                    <div ref={measureRef} style={{ width: "100%" }}>
                        {children}
                    </div>
                )}
            </Measure>

        </div>
    );
}

export default React.memo<OverflowingCellProps<any> & StyleProps>(OverflowingCell);
