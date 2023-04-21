import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { FieldArray } from "formik";

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

interface ArrayContainerProps<T> {
    value: T[];
    name: string;
    addLabel: string;
    buildEntry: (index: number, internalId: number) => React.ReactNode;
    disabled: boolean;
    small?: boolean;
    onInternalIdAdded?: (id: number) => void;
    includeAddButton?: boolean;
    newDefaultEntry?: T | null;
}

/**
 * @category Form custom fields
 */
export function ArrayContainer<T>({
                                      name,
                                      addLabel,
                                      value,
                                      disabled,
                                      buildEntry,
                                      small,
                                      onInternalIdAdded,
                                      includeAddButton,
                                      newDefaultEntry = null
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
    const animatedIds = useRef<Set<number>>(new Set(Object.values(internalIdsMap)));
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

    return <FieldArray
        name={name}
        validateOnChange={true}
        render={arrayHelpers => {
            return <ArrayContainerInternal
                disabled={disabled}
                internalIds={internalIds}
                onInternalIdAdded={onInternalIdAdded}
                setInternalIds={setInternalIds}
                arrayHelpers={arrayHelpers}
                newDefaultEntry={newDefaultEntry}
                value={value}
                name={name}
                small={small}
                buildEntry={buildEntry}
                hasValue={hasValue}
                includeAddButton={includeAddButton}
                addLabel={addLabel}
                animatedIds={animatedIds}
            />;
        }}
    />;
}

function ArrayContainerInternal<T>({
                                       disabled,
                                       internalIds,
                                       onInternalIdAdded,
                                       setInternalIds,
                                       arrayHelpers,
                                       newDefaultEntry,
                                       value,
                                       name,
                                       small,
                                       buildEntry,
                                       hasValue,
                                       includeAddButton,
                                       addLabel,
                                       animatedIds
                                   }: {
    disabled: boolean,
    internalIds: any,
    onInternalIdAdded: ((id: number) => void) | undefined,
    setInternalIds: any,
    arrayHelpers: any,
    newDefaultEntry: T | null | undefined,
    value: T[],
    name: string,
    small: boolean | undefined,
    buildEntry: (index: number, internalId: number) => React.ReactNode,
    hasValue: boolean,
    includeAddButton: boolean | undefined,
    addLabel: string,
    animatedIds: React.MutableRefObject<Set<number>>,
}) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const insertInEnd = useCallback(() => {
        if (disabled) return;
        const id = getRandomId();
        const newIds: number[] = [...internalIds, id];
        if (onInternalIdAdded)
            onInternalIdAdded(id);
        setInternalIds(newIds);
        arrayHelpers.push(newDefaultEntry);
    }, [arrayHelpers, disabled, internalIds, newDefaultEntry, onInternalIdAdded, setInternalIds]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const remove = useCallback((index: number) => {
        const newIds = [...internalIds];
        newIds.splice(index, 1);
        setInternalIds(newIds);
        animatedIds.current.delete(internalIds[index]);
        arrayHelpers.remove(index);
    }, [arrayHelpers, internalIds, setInternalIds]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const copy = useCallback((index: number) => {
        const id = getRandomId();
        const copyingItem = value[index];
        const newIds: number[] = [
            ...internalIds.splice(0, index + 1),
            id,
            ...internalIds.splice(index + 1, internalIds.length - index - 1)];
        if (onInternalIdAdded)
            onInternalIdAdded(id);
        setInternalIds(newIds);
        arrayHelpers.insert(index + 1, copyingItem);
    }, [arrayHelpers, internalIds, onInternalIdAdded, setInternalIds, value]);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const onDragEnd = useCallback((result: any) => {
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

        arrayHelpers.move(sourceIndex, destinationIndex);
    }, [arrayHelpers, internalIds, setInternalIds]);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId={`droppable_${name}`}
                       renderClone={(provided, snapshot, rubric) => {
                           const index = rubric.source.index;
                           const internalId = internalIds[index];
                           return (
                               <ArrayContainerItem
                                   provided={provided}
                                   internalId={internalId}
                                   index={index}
                                   name={name}
                                   small={small}
                                   disabled={disabled}
                                   buildEntry={buildEntry}
                                   remove={remove}
                                   copy={copy}
                                   animatedIds={animatedIds}
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
                                    key={`array_field_${name}_${internalId}`}
                                    draggableId={`array_field_${name}_${internalId}`}
                                    isDragDisabled={disabled}
                                    index={index}>
                                    {(provided, snapshot) => (
                                        <ArrayContainerItem
                                            provided={provided}
                                            internalId={internalId}
                                            index={index}
                                            name={name}
                                            small={small}
                                            disabled={disabled}
                                            buildEntry={buildEntry}
                                            remove={remove}
                                            copy={copy}
                                            animatedIds={animatedIds}
                                        />
                                    )}
                                </Draggable>
                            );
                        })}

                        {droppableProvided.placeholder}

                        {includeAddButton && <Box p={1}
                                                  justifyContent="center"
                                                  textAlign={"left"}>
                            <Button variant="outlined"
                                    size={"large"}
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
    name: string,
    internalId: number,
    small?: boolean,
    disabled: boolean,
    buildEntry: (index: number, internalId: number) => React.ReactNode,
    remove: (index: number) => void,
    copy: (index: number) => void,
    animatedIds: React.MutableRefObject<Set<number>>,
};

function ArrayContainerItem({
                                provided,
                                index,
                                name,
                                internalId,
                                small,
                                disabled,
                                buildEntry,
                                remove,
                                copy,
                                animatedIds
                            }: ArrayContainerItemProps) {

    const [measureRef, bounds] = useMeasure();
    const smallContent = bounds.height < 100;

    // WIP of animation
    // const initiallyDisplayed = animatedIds.current.has(internalId);
    // const [displayed, setDisplayed] = useState(initiallyDisplayed);
    // useEffect(() => {
    //     setDisplayed(true);
    //     animatedIds.current.add(internalId);
    // }, []);
    //
    // console.log(animatedIds.current);

    return <Box
        ref={provided.innerRef}
        {...provided.draggableProps}
        style={
            provided.draggableProps.style
        }
        sx={theme => ({
            marginBottom: 1,
            borderRadius: theme.shape.borderRadius,
            opacity: 1
        })}
    >
        {/*<Collapse*/}
        {/*    in={displayed}*/}
        {/*    appear={false}*/}
        {/*    enter={initiallyDisplayed}*/}
        {/*    timeout={500}>*/}
        <Box
            display="flex">
            <Box ref={measureRef}
                 flexGrow={1}
                 width={"calc(100% - 48px)"}
                // key={`field_${name}_entryValue`}
            >
                {buildEntry(index, internalId)}
            </Box>
            <ArrayItemOptions direction={small ? "row" : "column"}
                              disabled={disabled}
                              remove={remove}
                              index={index}
                              provided={provided}
                              smallContent={smallContent}
                              copy={copy}/>
        </Box>
        {/*</Collapse>*/}
    </Box>;
}

function ArrayItemOptions({
                              direction,
                              disabled,
                              remove,
                              index,
                              provided,
                              copy,
                              smallContent
                          }: {
    direction?: "row" | "column",
    smallContent: boolean,
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
                flexDirection={direction ?? "column"}
                sx={{
                    pl: 1
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

        {!smallContent && <>
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

        {smallContent && <>
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

function getRandomId() {
    return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
}
