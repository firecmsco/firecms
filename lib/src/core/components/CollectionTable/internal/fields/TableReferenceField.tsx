import React, { useCallback, useState } from "react";
import { Box, Button } from "@mui/material";
import { ReferencePreview } from "../../../../../preview";
import { ErrorView } from "../../../index";
import { CollectionSize, Entity, EntityReference } from "../../../../../models";
import { ReferenceDialog } from "../../../ReferenceDialog";

import { getPreviewSizeFrom } from "../../../../../preview/util";
import { getReferenceFrom } from "../../../../util/entities";
import { useNavigationContext } from "../../../../../hooks";

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
    setPreventOutsideClick: (value: any) => void;
}) {

    const {
        name,
        internalValue,
        setPreventOutsideClick,
        updateValue,
        multiselect,
        path,
        size,
        previewProperties,
        title,
        disabled
    } = props;

    const [onHover, setOnHover] = useState(false);
    const [open, setOpen] = useState<boolean>(false);

    const navigationContext = useNavigationContext();
    const collection = navigationContext.getCollection(path);
    if (!collection) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
    }
    const handleOpen = useCallback(() => {
        if (disabled)
            return;
        setPreventOutsideClick(true);
        setOpen(true);
    }, [disabled, setPreventOutsideClick]);

    const handleClose = useCallback(() => {
        setPreventOutsideClick(false);
        setOpen(false);
    }, [setPreventOutsideClick, setOpen]);

    const onSingleValueSet = useCallback((entity: Entity<any>) => {
        updateValue(entity ? getReferenceFrom(entity) : null);
        setPreventOutsideClick(false);
        setOpen(false);
    }, [updateValue, setPreventOutsideClick, setOpen]);

    const onMultipleEntitiesSelected = useCallback((entities: Entity<any>[]) => {
        updateValue(entities.map((e) => getReferenceFrom(e)));
    }, [updateValue]);

    const selectedIds = internalValue
        ? (Array.isArray(internalValue)
            ? internalValue.map((ref) => ref.id)
            : internalValue.id ? [internalValue.id] : [])
        : [];
    const valueNotSet = !internalValue || (Array.isArray(internalValue) && internalValue.length === 0);

    function buildSingleReferenceField() {
        if (internalValue instanceof EntityReference)
            return <ReferencePreview
                onClick={disabled ? undefined : handleOpen}
                size={getPreviewSizeFrom(size)}
                reference={internalValue as EntityReference}
                onHover={onHover}
                path={path}
                previewProperties={previewProperties}
            />;
        else
            return <ErrorView error={"Data is not a reference"}/>;
    }

    function buildMultipleReferenceField() {
        if (Array.isArray(internalValue))
            return <>
                {internalValue.map((reference, index) => {

                        return <Box sx={{ m: 0.5 }}
                                    key={`preview_array_ref_${name}_${index}`}>
                            <ReferencePreview
                                onClick={disabled ? undefined : handleOpen}
                                size={"tiny"}
                                reference={reference}
                                onHover={onHover}
                                path={path}
                                previewProperties={previewProperties}
                            />
                        </Box>;
                    }
                )
                }
            </>;
        else
            return <ErrorView error={"Data is not an array of references"}/>;
    }

    if (!collection)
        return <ErrorView error={"The specified collection does not exist"}/>;

    return (
        <div
            onMouseEnter={() => setOnHover(true)}
            onMouseMove={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)}>

            {internalValue && !multiselect &&
            buildSingleReferenceField()
            }

            {internalValue && multiselect &&
            buildMultipleReferenceField()
            }

            {valueNotSet &&
                <Button
                    onClick={handleOpen}
                    size={"small"}
                    variant="outlined"
                    color="primary">
                    Edit {title}
                </Button>}

            {!disabled &&
            open &&
            <ReferenceDialog open={open}
                             multiselect={multiselect}
                             path={path}
                             collection={collection}
                             onClose={handleClose}
                             onMultipleEntitiesSelected={onMultipleEntitiesSelected}
                             onSingleEntitySelected={onSingleValueSet}
                             selectedEntityIds={selectedIds}
            />}

        </div>
    );
}
