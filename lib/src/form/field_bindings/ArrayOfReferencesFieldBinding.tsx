import React, { useMemo } from "react";
import { Box, Button, FormControl, FormHelperText, Paper } from "@mui/material";
import {
    Entity,
    EntityCollection,
    EntityReference,
    FieldProps,
    ResolvedProperty
} from "../../models";
import { ReferencePropertyPreview } from "../../preview";
import { ArrayContainer, FieldDescription, LabelWithIcon } from "../components";
import { ErrorView, ReferenceDialog } from "../../core";

import { useClearRestoreValue, useNavigation } from "../../hooks";
import { getReferenceFrom } from "../../core/utils";


type ArrayOfReferencesFieldProps = FieldProps<EntityReference[]>;

/**
 * This field allows to select multiple references.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ArrayOfReferencesFieldBinding({
                                           propertyKey,
                                           value,
                                           error,
                                           showError,
                                           isSubmitting,
                                           tableMode,
                                           property,
                                           includeDescription,
                                           setValue
                                       }: ArrayOfReferencesFieldProps) {

    const ofProperty = property.of as ResolvedProperty;
    if (ofProperty.dataType !== "reference") {
        throw Error("ArrayOfReferencesField expected a property containing references");
    }

    const [open, setOpen] = React.useState(false);
    const [onHover, setOnHover] = React.useState(false);
    const selectedIds = value && Array.isArray(value) ? value.map((ref) => ref.id) : [];

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const navigationContext = useNavigation();
    const collectionResolver: EntityCollection | undefined = useMemo(() => {
        return ofProperty.path ? navigationContext.getCollection(ofProperty.path) : undefined;
    }, [ofProperty.path]);

    if (!collectionResolver) {
        throw Error(`Couldn't find the corresponding collection for the path: ${ofProperty.path}`);
    }

    const onEntryClick = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
    };

    const onMultipleEntitiesSelected = (entities: Entity<any>[]) => {
        setValue(entities.map(e => getReferenceFrom(e)));
    };

    const buildEntry = (index: number, internalId: number) => {
        const entryValue = value && value.length > index ? value[index] : undefined;
        if (!entryValue)
            return <div>Internal ERROR</div>;
        return (
            <div
                onMouseEnter={() => setOnHover(true)}
                onMouseMove={() => setOnHover(true)}
                onMouseLeave={() => setOnHover(false)}>
                <ReferencePropertyPreview
                    value={entryValue}
                    property={ofProperty}
                    onHover={onHover}
                    size={"regular"}
                    onClick={onEntryClick}/>
            </div>
        );
    };


    return (
        <>
            <FormControl fullWidth error={showError}>

                {!tableMode && <FormHelperText filled
                                               required={property.validation?.required}>
                    <LabelWithIcon property={property}/>
                </FormHelperText>}

                <Paper variant={"outlined"}
                       sx={(theme) => ({
                           elevation: 0,
                           padding: theme.spacing(2),
                           [theme.breakpoints.up("md")]: {
                               padding: theme.spacing(2)
                           }
                       })}>

                    {!collectionResolver && <ErrorView
                        error={"The specified collection does not exist. Check console"}/>}

                    {collectionResolver && <>

                        <ArrayContainer value={value}
                                        name={propertyKey}
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
                    </>}

                </Paper>

                {includeDescription &&
                <FieldDescription property={property}/>}

                {showError &&
                typeof error === "string" &&
                <FormHelperText>{error}</FormHelperText>}

            </FormControl>

            {collectionResolver && ofProperty.path && <ReferenceDialog open={open}
                                                    multiselect={true}
                                                    collection={collectionResolver}
                                                    path={ofProperty.path}
                                                    onClose={onClose}
                                                    onMultipleEntitiesSelected={onMultipleEntitiesSelected}
                                                    selectedEntityIds={selectedIds}
            />}
        </>
    );
}


