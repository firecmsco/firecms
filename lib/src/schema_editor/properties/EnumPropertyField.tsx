import React, { useMemo } from "react";
import { getIn, useFormikContext } from "formik";
import { Grid, Paper, Typography } from "@mui/material";
import { EnumValueConfig, NumberProperty, StringProperty } from "../../models";
import { resolveEnumValues } from "../../core/util/entities";
import { useSchemaRegistry } from "../../hooks/useSchemaRegistry";
import { EnumForm } from "../EnumForm";

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
                <Typography variant={"subtitle2"}>
                    Values
                </Typography>

                <Paper
                    variant={"outlined"}
                    sx={{ p: 2, mt: 1 }}>
                    <EnumForm enumValues={enumValues}
                              updateIds={updateIds}
                              onValuesChanged={(value) => {
                                  setFieldValue(enumValuesPath, value);
                              }}/>
                    {/*<EnumFormFields enumValuesPath={enumValuesPath}*/}
                    {/*    // @ts-ignore*/}
                    {/*                values={values}*/}
                    {/*                errors={errors}*/}
                    {/*                shouldUpdateId={updateIds}/>*/}
                </Paper>
            </Grid>

        </>
    );
}
