import React from "react";
import ClearIcon from "@material-ui/icons/Clear";
import DragHandleIcon from "@material-ui/icons/DragHandle";

import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import { Box, createStyles, IconButton, makeStyles } from "@material-ui/core";


const useStyles = makeStyles(theme => createStyles({
    arrayEntry: {
        marginBottom: theme.spacing(1),
        opacity: 1
    },
    arrayEntryDragging: {
        marginBottom: theme.spacing(1),
        border: "1px dashed gray",
        cursor: "move",
        opacity: 0.5
    },
    handle: {
        cursor: "move"
    }
}));

type ArrayEntryProps = {
    id: any
    name: string,
    moveItem: (dragIndex: number, hoverIndex: number) => void,
    type: string
    index: number,
    remove: (index: number) => void,
};

export const ArrayEntry: React.FC<ArrayEntryProps> = ({
                                                          id,
                                                          name,
                                                          moveItem,
                                                          type,
                                                          index,
                                                          remove,
                                                          children
                                                      }) => {

    const classes = useStyles();
    const ref = React.useRef<HTMLDivElement>(null);

    const [, drop] = useDrop({
        accept: type,
        hover(item: {
                  id: number
                  index: number,
                  type: string
              },
              monitor: DropTargetMonitor) {

            if (!ref.current) {
                return;
            }
            const dragIndex = item.index;
            const hoverIndex = index;

            // Don't replace items with themselves
            if (dragIndex === hoverIndex) {
                return;
            }

            if (!ref.current) {
                return;
            }

            // Determine rectangle on screen
            const hoverBoundingRect = ref.current.getBoundingClientRect();

            // Get vertical middle
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

            // Determine mouse position
            const clientOffset = monitor.getClientOffset();

            // Get pixels to the top
            const hoverClientY = clientOffset ? clientOffset .y - hoverBoundingRect.top : 0;

            // Dragging downwards
            if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY - 50) {
                return;
            }

            // Dragging upwards
            if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY + 50) {
                return;
            }

            // Time to actually perform the action
            moveItem(dragIndex, hoverIndex);

            // Note: we're mutating the monitor item here!
            // Generally it's better to avoid mutations,
            // but it's good here for the sake of performance
            // to avoid expensive index searches.
            item.index = hoverIndex;
        }
    });

    const [{ isDragging }, drag, preview] = useDrag({
        item: { type: type, id, index },
        collect: (monitor: any) => ({
            isDragging: monitor.isDragging()
        })
    });

    drag(drop(ref));

    return (
        <div ref={ref}
             className={isDragging ? classes.arrayEntryDragging : classes.arrayEntry}
        >
            <Box key={`field_${index}`}
                 display="flex">
                <Box flexGrow={1}
                     width={"100%"}
                     key={`field_${name}_entryValue`}>
                    {children}
                </Box>
                <Box width={"48px"}
                     display="flex"
                     flexDirection="column"
                     alignItems="center">
                    <div className={classes.handle}>
                        <DragHandleIcon fontSize={"small"}/>
                    </div>
                    <IconButton
                        size="small"
                        aria-label="remove"
                        onClick={() => remove(index)}>
                        <ClearIcon fontSize={"small"}/>
                    </IconButton>
                </Box>
            </Box>
        </div>
    );
}
