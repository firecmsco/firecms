import { FieldArray } from "formik";
import { Box, Button } from "@material-ui/core";
import React, { useEffect, useMemo, useRef, useState } from "react";
import hash from "object-hash";
import firebase from "firebase/app";
import "firebase/firestore";

import ArrayEntry from "./ArrayEntry";

interface ArrayContainerProps<T> {
    value: T[];
    name: string;
    buildEntry: (index: number, internalId: number) => React.ReactNode;
    disabled: boolean;
    onInternalIdAdded?: (id: number) => void;
    includeAddButton?: boolean;
}

/**
 * @category Form custom fields
 */
export default function ArrayContainer<T>({
                                              name,
                                              value,
                                              disabled,
                                              buildEntry,
                                              onInternalIdAdded,
                                              includeAddButton
                                          }: ArrayContainerProps<T>) {

    const hasValue = value && Array.isArray(value) && value.length > 0;

    const internalIdsMap: Record<string, number> = useMemo(() =>
            hasValue ?
                value.map(v => {
                    if (!v) return {};
                    return ({
                        [getHashValue(v)]: getRandomId()
                    });
                }).reduce((a, b) => ({ ...a, ...b }), {})
                : {},
        [value, hasValue]);
    const internalIdsRef = useRef<Record<string, number>>(internalIdsMap);

    const [internalIds, setInternalIds] = useState<number[]>(
        hasValue
            ? Object.values(internalIdsRef.current)
            : []);


    function getHashValue<T>(v: T) {
        if (typeof v === "object") {
            if ("id" in v)
                return (v as any)["id"];
            else if (v instanceof firebase.firestore.DocumentReference)
                return v.id;
            else if (v instanceof firebase.firestore.Timestamp)
                return v.toMillis();
            else if (v instanceof firebase.firestore.GeoPoint)
                return hash({ latitude: v.latitude, longitude: v.longitude });
        }
        return hash(v, { ignoreUnknown: true });
    }

    useEffect(() => {
        if (hasValue && value && value.length != internalIds.length) {
            const newInternalIds = value.map(v => {
                const hashValue = getHashValue(v);
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
    }, [hasValue, value]);

    function getRandomId() {
        return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
    }

    return <FieldArray
        name={name}
        validateOnChange={true}
        render={arrayHelpers => {

            const moveItem = (dragIndex: number, hoverIndex: number) => {
                const newIds = [...internalIds];
                const temp = newIds[dragIndex];
                newIds[dragIndex] = newIds[hoverIndex];
                newIds[hoverIndex] = temp;
                setInternalIds(newIds);
                arrayHelpers.move(dragIndex, hoverIndex);
            };

            const insertInEnd = () => {
                const id = getRandomId();
                const newIds: number[] = [...internalIds, id];
                if (onInternalIdAdded)
                    onInternalIdAdded(id);
                setInternalIds(newIds);
                arrayHelpers.push(null);
            };

            const remove = (index: number) => {
                const newValue = [...internalIds];
                newValue.splice(index, 1);
                setInternalIds(newValue);
                arrayHelpers.remove(index);
            };

            return (
                <>

                    {hasValue && internalIds.map((internalId: number, index: number) => {

                        const formField = buildEntry(index, internalId);
                        return (
                            <ArrayEntry
                                key={`array_field_${name}_${internalId}}`}
                                name={name}
                                id={internalId}
                                type={"array_card_" + name}
                                moveItem={moveItem}
                                index={index}
                                remove={remove}
                            >
                                {formField}
                            </ArrayEntry>);
                    })}

                    {includeAddButton && <Box p={1}
                                              justifyContent="center"
                                              textAlign={"left"}>
                        <Button variant="outlined"
                                color="primary"
                                disabled={disabled}
                                onClick={insertInEnd}>
                            Add
                        </Button>
                    </Box>}
                </>
            );
        }}
    />;
}


