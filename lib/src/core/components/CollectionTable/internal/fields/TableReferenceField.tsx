import React, { useCallback, useState } from "react";
import { Box, Button } from "@mui/material";
import { ReferencePreview } from "../../../../../preview";
import { ErrorView } from "../../../index";
import {
    ArrayProperty,
    CollectionSize,
    Entity,
    EntityReference,
    ReferenceProperty
} from "../../../../../models";
import { ReferenceDialog } from "../../../ReferenceDialog";

import { getPreviewSizeFrom } from "../../../../../preview/util";
import { getReferenceFrom } from "../../../../utils";
import { useNavigation } from "../../../../../hooks";


export function TableReferenceField(props: {
    name: string;
    disabled: boolean;
    internalValue: EntityReference | EntityReference[] | undefined | null;
    updateValue: (newValue: (EntityReference | EntityReference [] | null)) => void;
    property: ReferenceProperty | ArrayProperty<EntityReference[]>;
    size: CollectionSize;
    setPreventOutsideClick: (value: any) => void;
}) {

    const {
        name,
        internalValue,
        setPreventOutsideClick,
        property,
        updateValue,
        size,
        disabled
    } = props;

    let usedProperty: ReferenceProperty;
    let multiselect;
    if (property.dataType === "reference") {
        usedProperty = property;
        multiselect = false;
    } else if (property.dataType === "array" && property.of?.dataType === "reference") {
        usedProperty = property.of;
        multiselect = true;
    } else {
        throw Error("TableReferenceField misconfiguration");
    }

    if (typeof usedProperty.path !== "string") {
        throw Error("Picked the wrong component TableReferenceField");
    }

    const path = usedProperty.path;

    const [onHover, setOnHover] = useState(false);
    const [open, setOpen] = useState<boolean>(false);

    const navigationContext = useNavigation();
    const collection = navigationContext.getCollection(path);
    if (!collection) {
        throw Error(`Couldn't find the corresponding collection view for the path: ${path}`);
    }
    const handleOpen = useCallback((event: React.MouseEvent) => {
        if (disabled)
            return;
        if (event.detail <= 1) {
            event.stopPropagation();
            setPreventOutsideClick(true);
            setOpen(true);
        }
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
            return <ReferencePreview propertyKey={name}
                                     onClick={disabled ? undefined : handleOpen}
                                     value={internalValue as EntityReference}
                                     property={usedProperty}
                                     onHover={onHover}
                                     size={getPreviewSizeFrom(size)}
            />;
        else
            return <ErrorView error={"Data is not a reference"}/>;
    }

    function buildMultipleReferenceField() {
        if (Array.isArray(internalValue))
            return <>
                {internalValue.map((v, index) =>
                    <Box sx={{ m: 0.5 }}
                         key={`preview_array_ref_${name}_${index}`}>
                        <ReferencePreview
                            propertyKey={`${name}[${index}]`}
                            onClick={disabled ? undefined : handleOpen}
                            size={"tiny"}
                            onHover={onHover}
                            value={v}
                            property={usedProperty}

                        />
                    </Box>
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
                Edit {property.title}
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
