import React, { useCallback, useMemo } from "react";
import { FastField, Formik, getIn, useFormikContext } from "formik";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Grid,
    IconButton,
    Paper,
    Typography
} from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
    EnumValueConfig,
    EnumValues,
    NumberProperty,
    StringProperty
} from "../../../../models";
import { resolveEnumValues } from "../../../utils";
import { useSchemaRegistry } from "../../../../hooks/useSchemaRegistry";
import { ArrayContainer } from "../../../../form";
import DebouncedTextField from "../../../../form/components/DebouncedTextField";
import { useDebounce } from "../../../internal/useDebounce";
import equal from "react-fast-compare"
import {
    StringPropertyValidation
} from "./validation/StringPropertyValidation";
import { ArrayPropertyValidation } from "./validation/ArrayPropertyValidation";
import { CustomDialogActions } from "../../CustomDialogActions";
import { EnumForm } from "../EnumForm";

export function EnumPropertyField({
                                      multiselect,
                                      updateIds
                                  }: { multiselect: boolean, updateIds: boolean }) {

    const {
        values,
        handleChange,
        errors,
        touched,
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

    const [internalValue, setInternalValue] = React.useState<EnumValueConfig[]>(enumValues);
    const doUpdate = React.useCallback(() => {
        if (!equal(internalValue, enumValues)) {
            setFieldValue(enumValuesPath, internalValue);
        }
    }, [internalValue, enumValues]);
    useDebounce(internalValue, doUpdate, 64);

    return (
        <>
            <Grid item>
                <Typography variant={"subtitle2"} sx={{ mt: 1 }}>
                    Values
                </Typography>

                <Paper
                    variant={"outlined"}
                    sx={{ p: 2, mt: 1 }}>
                    <EnumForm enumValues={enumValues}
                              updateIds={updateIds}
                              onValuesChanged={setInternalValue}/>
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
