import React, { useCallback, useMemo } from "react";
import { FastField, Formik, getIn, useFormikContext } from "formik";
import { Grid, Paper, TextField, Typography } from "@mui/material";
import {
    EnumValueConfig,
    EnumValues,
    NumberProperty,
    StringProperty
} from "../../../../models";
import { resolveEnum } from "../../../utils";
import { useSchemaRegistry } from "../../../../hooks/useSchemaRegistry";
import { ArrayContainer } from "../../../../form";
import { useDebounce } from "../../../internal/useDebounce";
import equal from "react-fast-compare";

export function EnumForm({
                             enumValues,
                             onValuesChanged
                         }: {
    enumValues: EnumValueConfig[];
    onValuesChanged?: (enumValues: EnumValueConfig[]) => void;
}) {

    console.log("EnumForm");
    return (
        <Formik key={`Formik`}
                initialValues={{ enumValues }}
                onSubmit={(data: { enumValues: EnumValueConfig[] }, formikHelpers) => {
                }}
                render={({ values }) => {

                    // // eslint-disable-next-line react-hooks/rules-of-hooks
                    // React.useEffect(() => {
                    //     if (onValuesChanged && values.enumValues) {
                    //         onValuesChanged(values.enumValues);
                    //         console.log("onValuesChanged", values.enumValues);
                    //     }
                    // }, [values.enumValues]);

                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const doUpdate = useCallback(() => {
                        if (onValuesChanged && values.enumValues) {
                            onValuesChanged(values.enumValues);
                            console.log("onValuesChanged", values.enumValues);
                        }
                    }, [values.enumValues]);
// eslint-disable-next-line react-hooks/rules-of-hooks
                    useDebounce(values.enumValues, doUpdate);

                    const buildEntry = (index: number, internalId: number) => {
                        return <EnumEntry index={index} key={internalId}/>;
                    };

                    console.log("values", values.enumValues);
                    return (
                        <ArrayContainer
                            value={values.enumValues}
                            name={"enumValues"}
                            buildEntry={buildEntry}
                            disabled={false}
                            includeAddButton={true}/>
                    );
                }}
        />

    );

}

function EnumEntry({ index }: { index: number }) {

    const {
        values,
        handleChange,
        errors,
        setFieldValue,
        touched
    } = useFormikContext<EnumValues>();

    const idError = getIn(errors, "id");
    return <Grid container spacing={1}>
        <Grid item xs={7}>
            <FastField name={`enumValues.${index}.label`}
                       as={TextField}
                       label={"Label"}
                       required
                       fullWidth
                       helperText={idError}
                       size="small"
                       error={Boolean(idError)}/>
        </Grid>
        <Grid item xs={5}>
            <FastField name={`enumValues.${index}.id`}
                       as={TextField}
                       label={"Id"}
                       required
                       fullWidth
                       helperText={idError}
                       size="small"
                       error={Boolean(idError)}/>
        </Grid>
    </Grid>;
}

export function EnumPropertyField() {

    const {
        values,
        handleChange,
        errors,
        touched,
        setFieldValue
    } = useFormikContext<StringProperty | NumberProperty>();

    const schemaRegistry = useSchemaRegistry();

    const enumValues: EnumValueConfig[] = useMemo(() => {
        if (!values.enumValues || typeof values.enumValues === "boolean")
            return [] as EnumValueConfig[];
        return resolveEnum(values.enumValues, schemaRegistry.enumConfigs) ?? [] as EnumValueConfig[];
    }, [schemaRegistry.enumConfigs, values.enumValues]);

    const [internalValue, setInternalValue] = React.useState<EnumValueConfig[]>(enumValues);

    const doUpdate = React.useCallback(() => {
        if (!equal(internalValue, enumValues))
            setFieldValue("enumValues", internalValue);
    }, [internalValue, enumValues]);

    const onValuesChanged = useCallback((enumValues: EnumValueConfig[]) => {
        setInternalValue(enumValues);
    }, []);

    useDebounce(values.enumValues, doUpdate);

    return (
        <>
            <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
                Values
            </Typography>

            <Paper
                variant={"outlined"}
                sx={{ p: 2, mt: 1 }}>

                <EnumForm enumValues={internalValue}
                          onValuesChanged={onValuesChanged}/>
            </Paper>

        </>
    );
}
