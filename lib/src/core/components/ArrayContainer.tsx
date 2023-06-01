import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    Box,
    Button,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CopyIcon from "@mui/icons-material/ContentCopy";
import DragHandleIcon from "@mui/icons-material/DragHandle";

import {
    DragDropContext,
    Draggable,
    DraggableProvided,
    Droppable
} from "@hello-pangea/dnd";

import { getHashValue } from "../../core";
import useMeasure from "react-use-measure";
import { MoreVert } from "@mui/icons-material";
import { fieldBackgroundSubtleHover } from "../util/field_colors";

interface ArrayContainerProps<T> {
    droppableId: string;
    value: T[];
    addLabel: string;
    buildEntry: (index: number, internalId: number) => React.ReactNode;
    disabled?: boolean;
    small?: boolean;
    onInternalIdAdded?: (id: number) => void;
    includeAddButton?: boolean;
    newDefaultEntry: T;
    onValueChange: (value: T[]) => void
}

/**
 * @category Form custom fields
 */
export function ArrayContainer<T>({
                                      droppableId,
                                      addLabel,
                                      value,
                                      disabled = false,
                                      buildEntry,
                                      small,
                                      onInternalIdAdded,
                                      includeAddButton,
                                      newDefaultEntry,
                                      onValueChange
                                  }: ArrayContainerProps<T>) {

    const hasValue = value && Array.isArray(value) && value.length > 0;
    const internalIdsMap: Record<string, number> = useMemo(() =>
            hasValue
                ? value.map((v, index) => {
                    if (!v) return {};
                    return ({
                        [getHashValue(v) + index]: getRandomId()
                    });
                }).reduce((a, b) => ({ ...a, ...b }), {})
                : {},
        [value, hasValue]);

    // Used to track the ids that have displayed the initial show animation
    const internalIdsRef = useRef<Record<string, number>>(internalIdsMap);

    const [internalIds, setInternalIds] = useState<number[]>(
        hasValue
            ? Object.values(internalIdsRef.current)
            : []);

    useEffect(() => {
        if (hasValue && value && value.length !== internalIds.length) {
            const newInternalIds = value.map((v, index) => {
                const hashValue = getHashValue(v) + index;
                if (hashValue in internalIdsRef.current) {
                    return internalIdsRef.current[hashValue];
                } else {
                    const newInternalId = getRandomId();
                    internalIdsRef.current[hashValue] = newInternalId;
                    return newInternalId;
                }
            });
            setInternalIds(newInternalIds);
        }
    }, [hasValue, internalIds.length, value]);


    const insertInEnd = () => {
        if (disabled) return;
        const id = getRandomId();
        const newIds: number[] = [...internalIds, id];
        if (onInternalIdAdded)
            onInternalIdAdded(id);
        setInternalIds(newIds);
        onValueChange([...(value ?? []), newDefaultEntry]);
    };

    const remove = (index: number) => {
        const newIds = [...internalIds];
        newIds.splice(index, 1);
        setInternalIds(newIds);
        onValueChange(value.filter((_, i) => i !== index));
    };

    const copy = (index: number) => {
        const id = getRandomId();
        const copyingItem = value[index];
        const newIds: number[] = [
            ...internalIds.splice(0, index + 1),
            id,
            ...internalIds.splice(index + 1, internalIds.length - index - 1)];
        if (onInternalIdAdded)
            onInternalIdAdded(id);
        setInternalIds(newIds);
        // insert value in index + 1
        onValueChange([...value.slice(0, index + 1), copyingItem, ...value.slice(index + 1)]);
    };

    const onDragEnd = (result: any) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }
        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;

        const newIds = [...internalIds];
        const temp = newIds[sourceIndex];
        newIds[sourceIndex] = newIds[destinationIndex];
        newIds[destinationIndex] = temp;
        setInternalIds(newIds);

        onValueChange(arrayMove(value, sourceIndex, destinationIndex));
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={droppableId}
                       renderClone={(provided, snapshot, rubric) => {
                           const index = rubric.source.index;
                           const internalId = internalIds[index];
                           return (
                               <ArrayContainerItem
                                   provided={provided}
                                   internalId={internalId}
                                   index={index}
                                   small={small}
                                   disabled={disabled}
                                   buildEntry={buildEntry}
                                   remove={remove}
                                   copy={copy}
                                   isDragging={snapshot.isDragging}
                               />
                           );
                       }}
            >
                {(droppableProvided, droppableSnapshot) => (
                    <div
                        {...droppableProvided.droppableProps}
                        ref={droppableProvided.innerRef}>
                        {hasValue && internalIds.map((internalId: number, index: number) => {
                            return (
                                <Draggable
                                    key={`array_field_${internalId}`}
                                    draggableId={`array_field_${internalId}`}
                                    isDragDisabled={disabled}
                                    index={index}>
                                    {(provided, snapshot) => (
                                        <ArrayContainerItem
                                            provided={provided}
                                            internalId={internalId}
                                            index={index}
                                            small={small}
                                            disabled={disabled}
                                            buildEntry={buildEntry}
                                            remove={remove}
                                            copy={copy}
                                            isDragging={snapshot.isDragging}
                                        />
                                    )}
                                </Draggable>
                            );
                        })}

                        {droppableProvided.placeholder}

                        {includeAddButton && <Box p={1}
                                                  justifyContent="center"
                                                  textAlign={"left"}>
                            <Button
                                variant={small ? "text" : "outlined"}
                                size={small ? "small" : "large"}
                                color="primary"
                                disabled={disabled}
                                startIcon={<AddIcon/>}
                                onClick={insertInEnd}>
                                {addLabel ?? "Add"}
                            </Button>
                        </Box>}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}

type ArrayContainerItemProps = {
    provided: DraggableProvided,
    index: number,
    internalId: number,
    small?: boolean,
    disabled: boolean,
    buildEntry: (index: number, internalId: number) => React.ReactNode,
    remove: (index: number) => void,
    copy: (index: number) => void,
    isDragging: boolean,
};

export function ArrayContainerItem({
                                       provided,
                                       index,
                                       internalId,
                                       small,
                                       disabled,
                                       buildEntry,
                                       remove,
                                       copy,
                                       isDragging
                                   }: ArrayContainerItemProps) {

    const [measureRef, bounds] = useMeasure();
    const contentOverflow = !small && bounds.height > 0 && bounds.height < 100;

    const [onHover, setOnHover] = React.useState(false);
    const setOnHoverTrue = useCallback(() => setOnHover(true), []);
    const setOnHoverFalse = useCallback(() => setOnHover(false), []);

    return <Box
        onMouseEnter={setOnHoverTrue}
        onMouseMove={setOnHoverTrue}
        onMouseLeave={setOnHoverFalse}
        ref={provided.innerRef}
        {...provided.draggableProps}
        style={provided.draggableProps.style}
        sx={theme => ({
            backgroundColor: isDragging || onHover
                ? fieldBackgroundSubtleHover(theme)
                : undefined,
            marginBottom: 1,
            borderRadius: `${theme.shape.borderRadius}px`,
            opacity: 1
        })}
    >
        <Box
            display="flex"
            alignItems={"start"}>
            <Box ref={measureRef}
                 flexGrow={1}
                 width={"calc(100% - 48px)"}
            >
                {buildEntry(index, internalId)}
            </Box>
            <ArrayItemOptions direction={small ? "row" : "column"}
                              disabled={disabled}
                              remove={remove}
                              index={index}
                              provided={provided}
                              contentOverflow={contentOverflow}
                              copy={copy}/>
        </Box>
    </Box>;
}

export function ArrayItemOptions({
                                     direction,
                                     disabled,
                                     remove,
                                     index,
                                     provided,
                                     copy,
                                     contentOverflow
                                 }: {
    direction?: "row" | "column",
    contentOverflow: boolean,
    disabled: boolean,
    remove: (index: number) => void,
    index: number,
    provided: any,
    copy: (index: number) => void
}) {

    const [anchorEl, setAnchorEl] = React.useState<any | null>(null);

    const openMenu = useCallback((event: React.MouseEvent) => {
        setAnchorEl(event.currentTarget);
        event.stopPropagation();
    }, [setAnchorEl]);

    const closeMenu = useCallback(() => {
        setAnchorEl(null);
    }, [setAnchorEl]);

    return <Box display="flex"
                flexDirection={direction === "row" ? "row-reverse" : "column"}
                sx={{
                    pl: 1,
                    pt: 1
                }}
                alignItems="center">
        <div
            {...provided.dragHandleProps}>
            <Tooltip
                placement={direction === "column" ? "left" : undefined}
                title="Move">
                <IconButton
                    size="small"
                    disabled={disabled}
                    sx={{ cursor: disabled ? "inherit" : "move" }}>
                    <DragHandleIcon
                        fontSize={"small"}
                        color={disabled ? "disabled" : "inherit"}/>
                </IconButton>
            </Tooltip>
        </div>

        {!contentOverflow && <>
            <Tooltip
                title="Remove"
                placement={direction === "column" ? "left" : undefined}>
                <IconButton
                    size="small"
                    aria-label="remove"
                    disabled={disabled}
                    onClick={() => remove(index)}>
                    <RemoveIcon
                        fontSize={"small"}/>
                </IconButton>
            </Tooltip>

            <Tooltip
                placement={direction === "column" ? "left" : undefined}
                title="Copy in this position">
                <IconButton
                    size="small"
                    aria-label="copy"
                    disabled={disabled}
                    onClick={() => copy(index)}>
                    <CopyIcon
                        fontSize={"small"}/>
                </IconButton>
            </Tooltip>
        </>}

        {contentOverflow && <>
            <IconButton onClick={openMenu}
                        size={"small"}>
                <MoreVert/>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={closeMenu}
                elevation={3}
            >

                <MenuItem dense onClick={() => remove(index)}>
                    <ListItemIcon>
                        <RemoveIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Remove"/>
                </MenuItem>
                <MenuItem dense onClick={() => copy(index)}>
                    <ListItemIcon>
                        <CopyIcon/>
                    </ListItemIcon>
                    <ListItemText primary={"Copy"}/>
                </MenuItem>

            </Menu></>}
    </Box>;
}

function arrayMove(value: any[], sourceIndex: number, destinationIndex: number) {
    const result = Array.from(value);
    const [removed] = result.splice(sourceIndex, 1);
    result.splice(destinationIndex, 0, removed);
    return result;
}

export function getRandomId() {
    return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
}
