import React, { useMemo } from "react";
import { getIn, useFormikContext } from "formik";
import { Grid, Paper, Typography } from "@mui/material";
import {
    EnumValueConfig,
    NumberProperty,
    StringProperty
} from "../../../../models";
import { resolveEnumValues } from "../../../util/entities";
import { useSchemaRegistry } from "../../../../hooks/useSchemaRegistry";
import {
    StringPropertyValidation
} from "./validation/StringPropertyValidation";
import { ArrayPropertyValidation } from "./validation/ArrayPropertyValidation";
import { EnumFormFields } from "../EnumForm";

export function EnumPropertyField({
                                      multiselect,
                                      updateIds
                                  }: {
    multiselect: boolean, updateIds: boolean
}) {

    const {
        values,
        handleChange,
        errors,
        touched,
        setFieldError,
        setFieldValue
    } = useFormikContext<StringProperty | NumberProperty>();

    const schemaRegistry = useSchemaRegistry();
    const enumValuesPath = multiselect ? "of.enumValues" : "enumValues";

    const valuesEnumValues = getIn(values, enumValuesPath);
    const enumValues: EnumValueConfig[] = useMemo(() => {
        if (!valuesEnumValues || typeof valuesEnumValues === "boolean")
            return [] as EnumValueConfig[];
        return resolveEnumValues(valuesEnumValues, schemaRegistry.enumConfigs) ?? [] as EnumValueConfig[];
    }, [schemaRegistry.enumConfigs, valuesEnumValues]);

    return (
        <>
            <Grid item>
                <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
                    Values
                </Typography>

                <Paper
                    variant={"outlined"}
                    sx={{ p: 2, mt: 1 }}>
                    <EnumFormFields enumValuesPath={enumValuesPath}
                                    values={values}
                                    errors={errors}
                                    shouldUpdateId={updateIds}/>
                </Paper>
            </Grid>

            <Grid item>
                <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
                    Validation
                </Typography>
                <Paper variant={"outlined"} sx={{ p: 2, mt: 1 }}>
                    {!multiselect &&
                        <StringPropertyValidation/>}
                    {multiselect &&
                        <ArrayPropertyValidation/>}
                </Paper>
            </Grid>

        </>
    );
}
