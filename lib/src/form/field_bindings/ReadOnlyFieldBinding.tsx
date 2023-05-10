import React from "react";
import { FormControl, FormHelperText, Paper } from "@mui/material";

import { Entity, FieldProps } from "../../types";

import { PropertyPreview } from "../../preview";
import { FieldDescription } from "../index";
import { LabelWithIcon } from "../components";
import { ErrorBoundary } from "../../core/components/ErrorBoundary";
import { getIconForProperty } from "../../core";

/**
 *
 * Simply render the non-editable preview of a field
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function ReadOnlyFieldBinding({
                                         propertyKey,
                                         value,
                                         setValue,
                                         error,
                                         showError,
                                         isSubmitting,
                                         touched,
                                         tableMode,
                                         property,
                                         includeDescription,
                                         context
                                     }: FieldProps<any>) {

    if (!context.entityId)
        throw new Error("ReadOnlyFieldBinding: Entity id is null");

    const entity: Entity<any> = {
        id: context.entityId!,
        values: context.values,
        path: context.path
    };

    return (

        <FormControl fullWidth error={showError}>

            {!tableMode && <FormHelperText filled>
                <LabelWithIcon icon={getIconForProperty(property)}
                               title={property.name}/>
            </FormHelperText>}

            <Paper
                sx={(theme) => ({
                    minHeight: "56px",
                    elevation: 0,
                    padding: theme.spacing(2),
                    [theme.breakpoints.up("md")]: {
                        padding: theme.spacing(3)
                    }
                })}
                variant={"outlined"}>

                <ErrorBoundary>
                    <PropertyPreview propertyKey={propertyKey}
                                     value={value}
                                     property={property}
                                     entity={entity}
                                     size={"regular"}/>
                </ErrorBoundary>

            </Paper>

            {showError &&
                typeof error === "string" &&
                <FormHelperText error={true}>{error}</FormHelperText>}

            {includeDescription &&
                <FieldDescription property={property}/>}

        </FormControl>
    );
}
