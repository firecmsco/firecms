import { CollectionSize, EntitySchema } from "../models";
import React, { useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core";
import Measure from "react-measure";
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
            justifyContent: ({ align }) => {
                switch (align) {
                    case "right":
                        return "flex-end";
                    case "center":
                        return "center";
                    case "left":
                    default:
                        return "flex-start";
                }
            },
            padding: ({ size }) => {
                switch (size) {
                    case "xs":
                        return theme.spacing(0);
                    case "l":
                    case "xl":
                        return theme.spacing(2);
                    default:
                        return theme.spacing(1);
                }
            }
        },
        regular: {
            alignItems: "center"
        },
        overflowed: {
            "-webkit-mask-image": "linear-gradient(to bottom, black 70%, transparent 98%)",
            maskImage: "linear-gradient(to bottom, black 70%, transparent 98%)",
            alignItems: "start"
        }
    })
);

export interface StyleProps {
    size: CollectionSize;
    align: "right" | "left" | "center";
}

interface CollectionCellProps<S extends EntitySchema> {
    children: React.ReactNode;
}

function CollectionCell<S extends EntitySchema>({ children, size, align }: CollectionCellProps<S> & StyleProps) {

    const classes = useStyles({ size, align });
    const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
    const maxHeight = getRowHeight(size);
    return (
        <div className={clsx(
            classes.tableCell,
            {
                [classes.overflowed]: isOverflowing,
                [classes.regular]: !isOverflowing
            })}>
            <Measure
                bounds
                onResize={contentRect => {
                    if (contentRect?.bounds)
                        setIsOverflowing(contentRect.bounds.height - 16 > maxHeight);
                }}
            >
                {({ measureRef }) => (
                    <div ref={measureRef} style={{width: "100%"}}>
                        {children}
                    </div>
                )}
            </Measure>
        </div>

    );
}

export default React.memo<CollectionCellProps<any> & StyleProps>(CollectionCell);
