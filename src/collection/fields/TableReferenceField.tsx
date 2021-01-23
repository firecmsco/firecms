import React, { useState } from "react";
import { Button } from "@material-ui/core";
import { ReferencePreview } from "../../preview";
import {
    CollectionSize,
    Entity,
    EntityCollectionView,
    EntitySchema,
    ReferenceProperty
} from "../../models";
import { PreviewComponent } from "../../preview/PreviewComponent";
import { ReferenceDialog } from "../../references/ReferenceDialog";
import { getCollectionViewFromPath } from "../../routes/navigation";
import { CMSAppProps } from "../../CMSAppProps";
import { useAppConfigContext } from "../../contexts";
import { FormFieldBuilder } from "../../form";
import { CollectionTableProps } from "../CollectionTableProps";

import firebase from "firebase/app";
import "firebase/firestore";
import { getPreviewSizeFrom } from "../../preview/util";

export function TableReferenceField<S extends EntitySchema>(props: {
    name: string,
    internalValue: firebase.firestore.DocumentReference | undefined | null,
    updateValue: (newValue: (firebase.firestore.DocumentReference | null)) => void,
    property: ReferenceProperty;
    size: CollectionSize;
    schema: S,
    setPreventOutsideClick: (value: any) => void;
    createFormField: FormFieldBuilder;
    CollectionTable: React.FunctionComponent<CollectionTableProps<S>>
}) {

    const {
        name,
        internalValue,
        setPreventOutsideClick,
        property,
        updateValue,
        size,
        schema,
        createFormField,
        CollectionTable
    } = props;

    const collectionPath = property.collectionPath;

    const appConfig: CMSAppProps = useAppConfigContext();
    const collectionView: EntityCollectionView<S> =
        getCollectionViewFromPath(property.collectionPath, appConfig.navigation) as EntityCollectionView<S>;

    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = (event: React.MouseEvent) => {
        event.stopPropagation();
        console.trace("handleOpen");
        setPreventOutsideClick(true);
        setOpen(true);
    };

    const handleClose = () => {
        console.log("handleClose");
        setPreventOutsideClick(false);
        setOpen(false);
    };

    const handleEntityClick = (entity: Entity<any>) => {
        console.log("handleEntityClick", entity);
        const ref = entity ? entity.reference : null;
        updateValue(ref);
        setPreventOutsideClick(false);
        setOpen(false);
    };


    return (
        <>
            {internalValue &&
            <ReferencePreview name={name}
                              onClick={handleOpen}
                              value={internalValue}
                              property={property}
                              size={getPreviewSizeFrom(size)}
                              entitySchema={schema}
                              PreviewComponent={PreviewComponent}/>
            }

            {!internalValue &&
            <Button
                size={"small"}
                onClick={handleOpen}
                variant="outlined"
                color="primary">
                Set {property.title}
            </Button>}

            {collectionView && open && <ReferenceDialog open={open}
                                                        collectionPath={collectionPath}
                                                        onClose={handleClose}
                                                        collectionView={collectionView}
                                                        onEntityClick={handleEntityClick}
                                                        createFormField={createFormField}
                                                        CollectionTable={CollectionTable}
            />}
        </>
    );
}
