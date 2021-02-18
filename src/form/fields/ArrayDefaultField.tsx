import { Property } from "../../models";
import { FormControl, FormHelperText, Paper } from "@material-ui/core";
import { FieldProps } from "../../models/form_props";
import React, { useState } from "react";
import { FieldDescription } from "../../components";
import { LabelWithIcon } from "../../components/LabelWithIcon";
import ArrayContainer from "./arrays/ArrayContainer";
import { formStyles } from "../../styles";
import { CMSFormField } from "../form_factory";
import { useClearRestoreValue } from "../useClearRestoreValue";


type ArrayDefaultFieldProps<T> = FieldProps<T[]>;

export default function ArrayDefaultField<T>({
                                                 name,
                                                 value,
                                                 error,
                                                 showError,
                                                 isSubmitting,
                                                 setValue,
                                                 tableMode,
                                                 property,
                                                 CMSFormField,
                                                 includeDescription,
                                                 underlyingValueHasChanged,
                                                 context,
                                                 disabled,
                                                 dependsOnOtherProperties
                                             }: ArrayDefaultFieldProps<T>) {

    const ofProperty: Property = property.of as Property;
    const classes = formStyles();

    const [lastAddedId, setLastAddedId] = useState<number | undefined>();

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const buildEntry = (index: number, internalId: number) => {
        return <CMSFormField
            name={`${name}[${index}]`}
            disabled={disabled}
            property={ofProperty}
            includeDescription={includeDescription}
            underlyingValueHasChanged={underlyingValueHasChanged}
            context={context}
            tableMode={false}
            partOfArray={true}
            autoFocus={internalId === lastAddedId}
            dependsOnOtherProperties={false}
        />;

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


