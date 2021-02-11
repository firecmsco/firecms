import { Property } from "../../models";
import { FormControl, FormHelperText, Paper } from "@material-ui/core";
import { CMSFieldProps } from "../../models/form_props";
import React, { useState } from "react";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import ArrayContainer from "./arrays/ArrayContainer";
import { formStyles } from "../../styles";


type ArrayDefaultFieldProps<T> = CMSFieldProps<T[]>;

export default function ArrayDefaultField<T>({
                                                 name,
                                                 value,
                                                 error,
                                                 showError,
                                                 isSubmitting,
                                                 autoFocus,
                                                 touched,
                                                 tableMode,
                                                 property,
                                                 createFormField,
                                                 includeDescription,
                                                 underlyingValueHasChanged,
                                                 context
                                             }: ArrayDefaultFieldProps<T>) {

    const ofProperty: Property = property.of as Property;
    const classes = formStyles();

    const [lastAddedId, setLastAddedId] = useState<number | undefined>();

    const buildEntry = (index: number, internalId: number) => {
        return createFormField(
            {
                name: `${name}[${index}]`,
                property: ofProperty,
                includeDescription,
                underlyingValueHasChanged,
                context,
                tableMode: false,
                partOfArray: true,
                autoFocus: internalId === lastAddedId,
                dependsOnOtherProperties: false
            });
    };


    return (

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
                                onInternalIdAdded={setLastAddedId}
                                disabled={isSubmitting}
                                includeAddButton={true}/>

            </Paper>

            {includeDescription &&
            <FieldDescription property={property}/>}

            {showError
            && typeof error === "string"
            && <FormHelperText>{error}</FormHelperText>}

        </FormControl>
    );
}


