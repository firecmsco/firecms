import React, { useCallback, useMemo } from "react";

import { Entity, EntityCollection, EntityReference, FilterValues } from "../types";
import { getReferenceFrom } from "../util";
import { PreviewSize, ReferencePreview } from "../preview";
import { useNavigationController, useReferenceDialog } from "../hooks";
import { Button, cn } from "@firecms/ui";

export type ReferenceWidgetProps<M extends Record<string, any>> = {
    name?: string,
    multiselect?: boolean,
    value: EntityReference<M> | EntityReference<M>[] | null,
    onReferenceSelected?: (params: {
        reference: EntityReference<M> | null,
        entity: Entity<M> | null
    }) => void,
    onMultipleReferenceSelected?: (params: {
        references: EntityReference<M>[] | null,
        entities: Entity<M>[] | null
    }) => void,
    path: string,
    disabled?: boolean,
    previewProperties?: string[];
    /**
     * Allow selection of entities that pass the given filter only.
     */
    forceFilter?: FilterValues<string>;
    size: PreviewSize;
    className?: string;
};

/**
 * This field allows selecting reference/s.
 */
export function ReferenceWidget<M extends Record<string, any>>({
                                                                   name,
                                                                   multiselect = false,
                                                                   path,
                                                                   disabled,
                                                                   value,
                                                                   onReferenceSelected,
                                                                   onMultipleReferenceSelected,
                                                                   previewProperties,
                                                                   forceFilter,
                                                                   size,
                                                                   className
                                                               }: ReferenceWidgetProps<M>) {

    const navigationController = useNavigationController();

    const collection: EntityCollection | undefined = useMemo(() => {
        return navigationController.getCollection(path);
    }, [path, navigationController]);

    if (!collection) {
        throw Error(`Couldn't find the corresponding collection for the path: ${path}`);
    }

    const onSingleEntitySelected = useCallback((entity: Entity<M> | null) => {
        if (disabled)
            return;
        if (onReferenceSelected) {
            const reference = entity ? getReferenceFrom(entity) : null;
            onReferenceSelected?.({ reference, entity });
        }
    }, [disabled, onReferenceSelected]);

    const onMultipleEntitiesSelected = useCallback((entities: Entity<M>[]) => {
        if (disabled)
            return;
        if (onMultipleReferenceSelected) {
            const references = entities ? entities.map(e => getReferenceFrom(e)) : null;
            onMultipleReferenceSelected({ references, entities });
        }
    }, [disabled, onReferenceSelected]);

    const referenceDialogController = useReferenceDialog({
            multiselect,
            path,
            collection,
            onSingleEntitySelected,
            onMultipleEntitiesSelected,
            forceFilter
        }
    );

    const clearValue = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (multiselect) {
            onMultipleEntitiesSelected([]);
        } else {
            onSingleEntitySelected(null);
        }
    }, [onReferenceSelected]);

    let child: React.ReactNode;

    const onEntryClick = () => {
        if (disabled)
            return;
        referenceDialogController.open();
    };

    if (Array.isArray(value)) {
        child = <div className={"flex flex-col gap-4"}>
            {value.map((ref, index) => {
                return <ReferencePreview
                    key={`reference_preview_${index}`}
                    onClick={onEntryClick}
                    reference={ref}
                    disabled={disabled}
                    previewProperties={previewProperties}
                    size={size}/>
            })}
        </div>
    } else if (value instanceof EntityReference) {
        child = <ReferencePreview
            reference={value}
            onClick={onEntryClick}
            disabled={disabled}
            previewProperties={previewProperties}
            size={size}/>

    }
    return <div className={cn("text-sm font-medium text-gray-500",
        "min-w-80 flex flex-col gap-4",
        "relative transition-colors duration-200 ease-in rounded font-medium",
        disabled ? "bg-opacity-50" : "hover:bg-opacity-75",
        "text-opacity-50 dark:text-white dark:text-opacity-50",
        className
    )}
    >

        {child}
        {!value && <div className="justify-center text-left">
            <Button variant="outlined"
                    color="primary"
                    disabled={disabled}
                    onClick={onEntryClick}>
                Edit {name}
            </Button>
        </div>}

    </div>;
}
