import React, { useCallback, useMemo } from "react";

import { Entity, EntityCollection, EntityReference, FilterValues, PreviewSize } from "@firecms/types";
import { getReferenceFrom } from "../util";
import { ReferencePreview } from "../preview";
import { useNavigationController, useReferenceDialog } from "../hooks";
import { Button, cls } from "@firecms/ui";

export type ReferenceWidgetProps<M extends Record<string, any>> = {
    name?: string,
    multiselect?: boolean,
    value: EntityReference | EntityReference[] | null,
    onReferenceSelected?: (params: {
        reference: EntityReference | null,
        entity: Entity<M> | null
    }) => void,
    onMultipleReferenceSelected?: (params: {
        references: EntityReference[] | null,
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
    includeId?: boolean;
    includeEntityLink?: boolean;
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
                                                                   className,
                                                                   includeId,
                                                                   includeEntityLink
                                                               }: ReferenceWidgetProps<M>) {

    const navigationController = useNavigationController();

    const collection: EntityCollection | undefined = useMemo(() => {
        return navigationController.getCollection(path);
    }, [path, navigationController.getCollection]);

    const onSingleEntitySelected = useCallback((entity: Entity<M> | null) => {
        if (disabled)
            return;
        if (onReferenceSelected) {
            const reference = entity ? getReferenceFrom(entity) : null;
            onReferenceSelected?.({
                reference,
                entity
            });
        }
    }, [disabled, onReferenceSelected]);

    const onMultipleEntitiesSelected = useCallback((entities: Entity<M>[]) => {
        if (disabled)
            return;
        if (onMultipleReferenceSelected) {
            const references = entities ? entities.map(e => getReferenceFrom(e)) : null;
            onMultipleReferenceSelected({
                references,
                entities
            });
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
                    size={size}
                    includeId={includeId}
                    includeEntityLink={includeEntityLink}/>
            })}
        </div>
    } else if (value?.isEntityReference && value?.isEntityReference()) {
        child = <ReferencePreview
            reference={value}
            onClick={onEntryClick}
            disabled={disabled}
            previewProperties={previewProperties}
            size={size}
            includeId={includeId}
            includeEntityLink={includeEntityLink}/>

    }
    return <div className={cls("text-sm font-medium",
        "min-w-80 flex flex-col gap-4",
        "relative transition-colors duration-200 ease-in rounded-xs font-medium",
        disabled ? "bg-opacity-50" : "hover:bg-opacity-75",
        "dark:text-white/50 dark:text-text-primary-dark/50",
        className
    )}>

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
