import { ArrayContainer } from "../../components";
import React from "react";

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
    className?: string;
}

/**
 * @group Form custom fields
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
                                            setFieldValue,
                                            className
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
                           className={className}
                           onValueChange={(value) => setFieldValue(name, value)}
    />;
}
