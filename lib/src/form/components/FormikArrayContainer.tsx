import React from "react";
import { ArrayContainer } from "../../core";

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
    setFieldValue: (field: string, value: any, shouldValidate?: boolean | undefined) => void;
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
                                            newDefaultEntry = null,
                                            setFieldValue
                                        }: ArrayContainerProps<T>) {

    return <ArrayContainer droppableId={name}
                           addLabel={addLabel}
                           value={value}
                           disabled={disabled}
                           buildEntry={buildEntry}
                           size={small ? "small" : "medium"}
                           onInternalIdAdded={onInternalIdAdded}
                           includeAddButton={includeAddButton}
                           newDefaultEntry={newDefaultEntry}
                           onValueChange={(value) => setFieldValue(name, value)}
    />;
}
