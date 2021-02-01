import { Entity, EntityCollection, Property } from "../../models";
import { Box, Button, FormControl, FormHelperText, Paper } from "@material-ui/core";
import { CMSFieldProps } from "../../models/form_props";
import React from "react";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import ArrayContainer from "./arrays/ArrayContainer";
import { PreviewComponent, ReferencePreview } from "../../preview";
import firebase from "firebase";
import { CMSAppProps } from "../../CMSAppProps";
import { useAppConfigContext } from "../../contexts";
import { getCollectionViewFromPath } from "../../routes/navigation";
import { ReferenceDialog } from "../../components/ReferenceDialog";
import { CollectionTable } from "../../collection/CollectionTable";
import { formStyles } from "../../styles";


type ArrayOfReferencesFieldProps = CMSFieldProps<firebase.firestore.DocumentReference[]>;

export default function ArrayOfReferencesField({
                                                   name,
                                                   value,
                                                   error,
                                                   showError,
                                                   isSubmitting,
                                                   tableMode,
                                                   property,
                                                   createFormField,
                                                   includeDescription,
                                                   setValue,
                                                   context
                                               }: ArrayOfReferencesFieldProps) {

    const classes = formStyles();

    const ofProperty: Property = property.of as Property;
    if (ofProperty.dataType !== "reference") {
        throw Error("ArrayOfReferencesField expected a property containing references");
    }

    const appConfig: CMSAppProps = useAppConfigContext();
    const collectionView: EntityCollection<any> = getCollectionViewFromPath(ofProperty.collectionPath, appConfig.navigation);

    const [open, setOpen] = React.useState(false);
    const selectedIds = value ? value.map((ref) => ref.id) : [];

    const onEntryClick = () => {
        setOpen(true)
    };

    const onClose = () => {
        setOpen(false)
    };

    const onMultipleEntitiesSelected = (entities:Entity<any>[]) => {
        setValue(entities.map((e) => e.reference));
    };

    const buildEntry = (index: number, internalId: number) => {
        const entryValue = value && value.length > index ? value[index] : undefined;
        if (!entryValue)
            return <div>Internal ERROR</div>;
        return <ReferencePreview
                                 value={entryValue}
                                 property={ofProperty}
                                 size={"regular"}
                                 entitySchema={context.entitySchema}
                                 PreviewComponent={PreviewComponent}
                                 onClick={onEntryClick}/>;
    };


    return (
        <>
            <FormControl fullWidth error={showError}>

                {!tableMode && <FormHelperText filled
                                               required={property.validation?.required}>
                    <LabelWithIcon scaledIcon={true} property={property}/>
                </FormHelperText>}

                <Paper variant={"outlined"}
                       className={classes.paper}>
                <ArrayContainer value={value}
                                name={name}
                                buildEntry={buildEntry}
                                disabled={isSubmitting}/>

                <Box p={1}
                     justifyContent="center"
                     textAlign={"left"}>
                    <Button variant="outlined"
                            color="primary"
                            disabled={isSubmitting}
                            onClick={onEntryClick}>
                        Edit {property.title}
                    </Button>
                </Box>

                </Paper>
                {includeDescription &&
                <FieldDescription property={property}/>}

                {showError
                && typeof error === "string"
                && <FormHelperText>{error}</FormHelperText>}


            </FormControl>

            {collectionView && <ReferenceDialog open={open}
                                                multiselect={true}
                                                collectionPath={ofProperty.collectionPath}
                                                collectionView={collectionView}
                                                onClose={onClose}
                                                onMultipleEntitiesSelected={onMultipleEntitiesSelected}
                                                createFormField={createFormField}
                                                CollectionTable={CollectionTable}
                                                selectedEntityIds={selectedIds}
            />}
        </>
    );
}


