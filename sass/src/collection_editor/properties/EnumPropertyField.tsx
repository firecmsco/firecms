import React, { useMemo } from "react";
import { getIn, useFormikContext } from "formik";
import { Box, Grid, Paper, Typography } from "@mui/material";
import {
    EnumValueConfig,
    NumberProperty,
    resolveEnumValues,
    StringProperty
} from "@camberi/firecms";
import ListIcon from "@mui/icons-material/List";
import { EnumForm } from "../EnumForm";
import {
    StringPropertyValidation
} from "./validation/StringPropertyValidation";
import { ArrayPropertyValidation } from "./validation/ArrayPropertyValidation";
import { ValidationPanel } from "./ValidationPanel";

export function EnumPropertyField({
                                      multiselect,
                                      updateIds,
                                      disabled,
                                      showErrors
                                  }: {
    multiselect: boolean;
    updateIds: boolean;
    disabled: boolean;
    showErrors: boolean;
}) {

    const {
        values,
        handleChange,
        errors,
        touched,
        setFieldError,
        setFieldValue
    } = useFormikContext<StringProperty | NumberProperty>();

    const enumValuesPath = multiselect ? "of.enumValues" : "enumValues";

    const valuesEnumValues = getIn(values, enumValuesPath);
    const enumValues: EnumValueConfig[] = useMemo(() => {
        if (!valuesEnumValues || typeof valuesEnumValues === "boolean")
            return [] as EnumValueConfig[];
        return resolveEnumValues(valuesEnumValues) ?? [] as EnumValueConfig[];
    }, [valuesEnumValues]);

    return (
        <>
            <Grid item>
                <Box sx={(theme) => ({
                    display: "flex",
                    flexDirection: "row",
                    color: theme.palette.text.secondary,
                    alignItems: "center"
                })}>
                    <ListIcon/>
                    <Typography variant={"subtitle2"}
                                sx={(theme) => ({
                                    ml: 2,
                                    color: theme.palette.text.secondary
                                })}>
                        Values
                    </Typography>
                </Box>

                <Paper
                    variant={"outlined"}
                    sx={{ p: 2, mt: 1 }}>
                    <EnumForm enumValues={enumValues}
                              updateIds={updateIds}
                              disabled={disabled}
                              onValuesChanged={(value) => setFieldValue(enumValuesPath, value)}/>
                </Paper>
            </Grid>

            <Grid item xs={12}>

                <ValidationPanel>
                    {!multiselect &&
                        <StringPropertyValidation disabled={disabled} showErrors={showErrors}/>}
                    {multiselect &&
                        <ArrayPropertyValidation disabled={disabled}/>}
                </ValidationPanel>

            </Grid>
        </>
    );
}
