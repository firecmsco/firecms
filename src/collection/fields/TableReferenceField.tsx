import React, { useState } from "react";
import { Button } from "@material-ui/core";
import { ReferencePreview } from "../../preview";
import {
    ArrayProperty,
    CMSFormFieldProps,
    CollectionSize,
    Entity,
    EntityCollection,
    EntitySchema,
    ReferenceProperty
} from "../../models";
import { PreviewComponent } from "../../preview/PreviewComponent";
import { ReferenceDialog } from "../../components/ReferenceDialog";
import { CollectionTableProps } from "../CollectionTableProps";

import firebase from "firebase/app";
import "firebase/firestore";
import { getPreviewSizeFrom } from "../../preview/util";
import { useInputStyles } from "./styles";
import { PreviewError } from "../../preview/components/PreviewError";
import { useSchemasRegistry } from "../../side_dialog/SchemaRegistry";


export function TableReferenceField<S extends EntitySchema<Key>, Key extends string>(props: {
    name: string;
    disabled: boolean;
    internalValue: firebase.firestore.DocumentReference | firebase.firestore.DocumentReference[] | undefined | null;
    updateValue: (newValue: (firebase.firestore.DocumentReference | firebase.firestore.DocumentReference [] | null)) => void;
    property: ReferenceProperty | ArrayProperty<firebase.firestore.DocumentReference>;
    size: CollectionSize;
    schema: S;
    setPreventOutsideClick: (value: any) => void;
    CMSFormField: React.FunctionComponent<CMSFormFieldProps<S, Key>>;
    CollectionTable: React.FunctionComponent<CollectionTableProps<S, Key>>;
}) {

    const {
        name,
        internalValue,
        setPreventOutsideClick,
        property,
        updateValue,
        size,
        disabled,
        CMSFormField,
        CollectionTable
    } = props;

    let usedProperty: ReferenceProperty;
    let multiselect;
    if (property.dataType === "reference") {
        usedProperty = property;
        multiselect = false;
    } else if (property.dataType === "array" && property.of.dataType === "reference") {
        usedProperty = property.of;
        multiselect = true;
    } else {
        throw Error("TableReferenceField misconfiguration");
    }

    const classes = useInputStyles();
    const collectionPath = usedProperty.collectionPath;

    const schemaRegistry = useSchemasRegistry();
    const collectionConfig: EntityCollection<any> = schemaRegistry.getCollectionConfig(usedProperty.collectionPath);

    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = (event: React.MouseEvent) => {
        if (disabled)
            return;
        if (event.detail <= 1) {
            event.stopPropagation();
            setPreventOutsideClick(true);
            setOpen(true);
        }
    };

    const handleClose = () => {
        setPreventOutsideClick(false);
        setOpen(false);
    };

    const onSingleValueSet = (entity: Entity<any>) => {
        const ref = entity ? entity.reference : null;
        updateValue(ref);
        setPreventOutsideClick(false);
        setOpen(false);
    };

    const onMultipleEntitiesSelected = (entities: Entity<any>[]) => {
        updateValue(entities.map((e) => e.reference));
    };

    const selectedIds = internalValue ?
        (Array.isArray(internalValue) ?
            internalValue.map((ref) => ref.id) :
            internalValue.id ? [internalValue.id] : [])
        : [];
    const valueNotSet = !internalValue || (Array.isArray(internalValue) && internalValue.length === 0);

    function buildSingleReferenceField() {
        if (internalValue instanceof firebase.firestore.DocumentReference)
            return <ReferencePreview name={name}
                                     onClick={disabled ? undefined: handleOpen}
                                     value={internalValue as firebase.firestore.DocumentReference}
                                     property={usedProperty}
                                     size={getPreviewSizeFrom(size)}
                                     PreviewComponent={PreviewComponent}/>;
        else
            return <PreviewError error={"Data is not a reference"}/>;
    }

    function buildMultipleReferenceField() {
        if (Array.isArray(internalValue))
            return <>
                {internalValue.map((v, index) =>
                    <div className={classes.arrayItem}
                         key={`preview_array_ref_${name}_${index}`}>
                        <ReferencePreview
                            name={`${name}[${index}]`}
                            onClick={disabled ? undefined: handleOpen}
                            size={"tiny"}
                            value={v}
                            property={usedProperty}
                            PreviewComponent={PreviewComponent}
                        />
                    </div>
                )
                }
            </>;
        else
            return <PreviewError error={"Data is not an array of references"}/>;
    }

    return (
        <>

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

            {!disabled
            && collectionConfig
            && open
            && <ReferenceDialog open={open}
                                multiselect={multiselect}
                                collectionPath={collectionPath}
                                onClose={handleClose}
                                onMultipleEntitiesSelected={onMultipleEntitiesSelected}
                                onSingleEntitySelected={onSingleValueSet}
                                CMSFormField={CMSFormField}
                                CollectionTable={CollectionTable as any}
                                selectedEntityIds={selectedIds}
            />}

        </>
    );
}
