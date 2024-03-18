import React, { useCallback, useState } from "react";
import equal from "react-fast-compare"

import { ReferencePreview } from "../../../preview";
import { CollectionSize, Entity, EntityCollection, EntityReference, FilterValues } from "../../../types";

import { getPreviewSizeFrom } from "../../../preview/util";
import { getReferenceFrom } from "../../../util";
import { useCustomizationController, useNavigationController, useReferenceDialog } from "../../../hooks";
import { ErrorView } from "../../ErrorView";
import { Button } from "@firecms/ui";
import { EntityPreviewContainer } from "../../EntityPreview";

type TableReferenceFieldProps = {
    name: string;
    disabled: boolean;
    internalValue: EntityReference | EntityReference[] | undefined | null;
    updateValue: (newValue: (EntityReference | EntityReference [] | null)) => void;
    size: CollectionSize;
    multiselect: boolean;
    previewProperties?: string[];
    title?: string;
    path: string;
    forceFilter?: FilterValues<string>;
};

export function TableReferenceField(props: TableReferenceFieldProps) {
    const customizationController = useCustomizationController();

    const navigationController = useNavigationController();
    const { path } = props;
    const collection = navigationController.getCollection<EntityCollection>(path);
    if (!collection) {
        if (customizationController.components?.missingReference) {
            return <customizationController.components.missingReference path={path}/>;
        } else {
            throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
        }
    }
    return <TableReferenceFieldSuccess {...props} collection={collection}/>;
}

export const TableReferenceFieldSuccess = React.memo(
    function TableReferenceFieldSuccess(props: TableReferenceFieldProps & {
        collection: EntityCollection;
    }) {
        const {
            name,
            internalValue,
            updateValue,
            multiselect,
            path,
            size,
            previewProperties,
            title,
            disabled,
            forceFilter,
            collection
        } = props;

        const onSingleEntitySelected = useCallback((entity: Entity<any>) => {
            updateValue(entity ? getReferenceFrom(entity) : null);
        }, [updateValue]);

        const onMultipleEntitiesSelected = useCallback((entities: Entity<any>[]) => {
            updateValue(entities.map((e) => getReferenceFrom(e)));
        }, [updateValue]);

        const selectedEntityIds = internalValue
            ? (Array.isArray(internalValue)
                ? internalValue.map((ref) => ref.id)
                : internalValue.id ? [internalValue.id] : [])
            : [];

        const referenceDialogController = useReferenceDialog({
                multiselect,
                path,
                collection,
                onMultipleEntitiesSelected,
                onSingleEntitySelected,
                selectedEntityIds,
                forceFilter
            }
        );

        const handleOpen = useCallback(() => {
            if (disabled)
                return;
            referenceDialogController.open();
        }, [disabled, referenceDialogController]);

        const valueNotSet = !internalValue || (Array.isArray(internalValue) && internalValue.length === 0);

        const buildSingleReferenceField = () => {
            if (internalValue && !Array.isArray(internalValue) && internalValue.isEntityReference && internalValue.isEntityReference())
                return <ReferencePreview
                    onClick={disabled ? undefined : handleOpen}
                    size={getPreviewSizeFrom(size)}
                    reference={internalValue as EntityReference}
                    hover={!disabled}
                    disabled={!path}
                    previewProperties={previewProperties}
                />;
            else
                return <EntityPreviewContainer
                    onClick={disabled ? undefined : handleOpen}
                    size={getPreviewSizeFrom(size)}>
                    <ErrorView title="Value is not a reference." error={"Click to edit"}/>
                </EntityPreviewContainer>;
        };

        const buildMultipleReferenceField = () => {
            if (Array.isArray(internalValue))
                return <>
                    {internalValue.map((reference, index) =>
                        <div className="w-full my-0.5"
                             key={`preview_array_ref_${name}_${index}`}>
                            <ReferencePreview
                                onClick={disabled ? undefined : handleOpen}
                                size={"tiny"}
                                reference={reference}
                                hover={!disabled}
                                disabled={!path}
                                previewProperties={previewProperties}
                            />
                        </div>
                    )
                    }
                </>;
            else
                return <ErrorView error={"Data is not an array of references"}/>;
        };

        if (!collection)
            return <ErrorView error={"The specified collection does not exist"}/>;

        return (
            <div className="w-full group">

                {internalValue && !multiselect && buildSingleReferenceField()}

                {internalValue && multiselect && buildMultipleReferenceField()}

                {valueNotSet &&
                    <Button
                        onClick={handleOpen}
                        size={"small"}
                        variant="outlined"
                        color="primary">
                        Edit {title}
                    </Button>}

            </div>
        );
    }, equal);
