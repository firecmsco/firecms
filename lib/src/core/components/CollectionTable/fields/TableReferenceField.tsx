import React, { useCallback, useState } from "react";
import { Box, Button } from "@mui/material";
import { ReferencePreview } from "../../../../preview";
import { ErrorView } from "../../index";
import { CollectionSize, Entity, EntityReference } from "../../../../models";
import { useReferenceDialogController } from "../../ReferenceDialog";

import { getPreviewSizeFrom } from "../../../../preview/util";
import { getReferenceFrom } from "../../../util";
import { useNavigationContext } from "../../../../hooks";

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

    const navigationContext = useNavigationContext();

    const collection = navigationContext.getCollection(path);
    if (!collection) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
    }

    const handleClose = useCallback(() => {
        setPreventOutsideClick(false);
    }, [setPreventOutsideClick]);

    const onSingleEntitySelected = useCallback((entity: Entity<any>) => {
        updateValue(entity ? getReferenceFrom(entity) : null);
        setPreventOutsideClick(false);
    }, [updateValue, setPreventOutsideClick]);

    const onMultipleEntitiesSelected = useCallback((entities: Entity<any>[]) => {
        updateValue(entities.map((e) => getReferenceFrom(e)));
    }, [updateValue]);

    const selectedEntityIds = internalValue
        ? (Array.isArray(internalValue)
            ? internalValue.map((ref) => ref.id)
            : internalValue.id ? [internalValue.id] : [])
        : [];

    const referenceDialogController = useReferenceDialogController({
            multiselect,
            path,
            collection,
            onClose: handleClose,
            onMultipleEntitiesSelected,
            onSingleEntitySelected,
            selectedEntityIds
        }
    );

    const handleOpen = useCallback(() => {
        if (disabled)
            return;
        setPreventOutsideClick(true);
        referenceDialogController.open();
    }, [disabled, referenceDialogController, setPreventOutsideClick]);

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
                {internalValue.map((reference, index) => {

                        return <Box sx={{ m: 0.5 }}
                                    key={`preview_array_ref_${name}_${index}`}>
                            <ReferencePreview
                                onClick={disabled ? undefined : handleOpen}
                                size={"tiny"}
                                reference={reference}
                                onHover={onHover}
                                disabled={!path}
                                previewProperties={previewProperties}
                            />
                        </Box>;
                    }
                )
                }
            </>;
        else
            return <ErrorView error={"Data is not an array of references"}/>;
    };

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

        </div>
    );
}
