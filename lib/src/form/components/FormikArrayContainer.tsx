import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { FieldArray } from "formik";

import { Box, Button } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";

import { getHashValue } from "../../core";
import {
    ArrayContainerItem,
    getRandomId
} from "../../core/components/ArrayContainer";

interface ArrayContainerProps<T> {
    value: T[];
    name: string;
    addLabel: string;
    buildEntry: (index: number, internalId: number) => React.ReactNode;
    disabled?: boolean;
    small?: boolean;
    onInternalIdAdded?: (id: number) => void;
    includeAddButton?: boolean;
    newDefaultEntry?: T | null;
}

/**
 * @category Form custom fields
 */
export function FormikArrayContainer<T>({
                                      name,
                                      addLabel,
                                      value,
                                      disabled = false,
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
                                    key={`array_field_${name}_${internalId}`}
                                    draggableId={`array_field_${name}_${internalId}`}
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
