import React, { useCallback, useState } from "react";
import { Box, Button } from "@mui/material";
import { ReferencePreview } from "../../../../preview";
import {
    CollectionSize,
    Entity,
    EntityReference,
    FilterValues
} from "../../../../types";

import { getPreviewSizeFrom } from "../../../../preview/util";
import { getReferenceFrom } from "../../../util";
import { useNavigationContext, useReferenceDialog } from "../../../../hooks";
import { ErrorView } from "../../ErrorView";

export function TableReferenceField(props: {
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
        forceFilter
    } = props;

    const [onHover, setOnHover] = useState(false);

    const hoverTrue = useCallback(() => setOnHover(true), []);
    const hoverFalse = useCallback(() => setOnHover(false), []);

    const navigationContext = useNavigationContext();

    const collection = navigationContext.getCollection(path);
    if (!collection) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
    }

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
        if (internalValue instanceof EntityReference)
            return <ReferencePreview
                onClick={disabled ? undefined : handleOpen}
                size={getPreviewSizeFrom(size)}
                reference={internalValue as EntityReference}
                onHover={onHover}
                disabled={!path}
                previewProperties={previewProperties}
            />;
        else
            return <ErrorView error={"Data is not a reference"}/>;
    };

    const buildMultipleReferenceField = () => {
        if (Array.isArray(internalValue))
            return <>
                {internalValue.map((reference, index) =>
                    <Box sx={{ m: 0.5, width: "100%" }}
                         key={`preview_array_ref_${name}_${index}`}>
                        <ReferencePreview
                            onClick={disabled ? undefined : handleOpen}
                            size={"tiny"}
                            reference={reference}
                            onHover={onHover}
                            disabled={!path}
                            previewProperties={previewProperties}
                        />
                    </Box>
                )
                }
            </>;
        else
            return <ErrorView error={"Data is not an array of references"}/>;
    };

    if (!collection)
        return <ErrorView error={"The specified collection does not exist"}/>;

    return (
        <Box sx={{ width: "100%" }}
             onMouseEnter={hoverTrue}
             onMouseMove={hoverTrue}
             onMouseLeave={hoverFalse}>

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

        </Box>
    );
}
