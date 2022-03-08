import React, { useCallback, useEffect } from "react";

import { FastField, Field, Formik, getIn, useFormikContext } from "formik";
import { Box, Button, Dialog, DialogContent, IconButton } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import DebouncedTextField from "../form/components/DebouncedTextField";
import { EnumValueConfig, EnumValues } from "../models";
import { ArrayContainer } from "../form";
import { CustomDialogActions } from "../core/components/CustomDialogActions";

export function EnumForm({
                             enumValues,
                             onValuesChanged,
                             onError,
                             updateIds
                         }: {
    enumValues: EnumValueConfig[];
    onValuesChanged?: (enumValues: EnumValueConfig[]) => void;
    onError?: (error: boolean) => void;
    updateIds: boolean;
}) {

    return (
        <Formik initialValues={{ enumValues }}
                enableReinitialize={true}
                validateOnMount={true}
                validate={() => console.log("enum validate")}
                onSubmit={(data: { enumValues: EnumValueConfig[] }, formikHelpers) => {
                }}
                render={({ values, errors }) => {
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    useEffect(() => {
                        if (onValuesChanged) {
                            onValuesChanged(values.enumValues);
                        }
                    }, [values.enumValues]);
                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    useEffect(() => {
                        if (onError)
                            onError(Boolean(errors?.enumValues ?? false));
                    }, [errors]);

                    return <EnumFormFields enumValuesPath={"enumValues"}
                                           values={values}
                                           errors={errors}
                                           shouldUpdateId={updateIds}/>
                }}
        />

    );

}

export function EnumFormFields({
                                   values,
                                   errors,
                                   enumValuesPath,
                                   shouldUpdateId
                               }: {
    values: { enumValues: EnumValueConfig[] },
    errors: any,
    enumValuesPath: string,
    shouldUpdateId: boolean,
}) {

    const [lastInternalIdAdded, setLastInternalIdAdded] = React.useState<number | undefined>();

    const buildEntry = useCallback((index: number, internalId: number) => {
        return <EnumEntry index={index}
                          enumValuesPath={enumValuesPath}
                          autoFocus={lastInternalIdAdded === internalId}
                          shouldUpdateId={shouldUpdateId}
                          key={`${internalId}`}/>;
    }, [enumValuesPath, lastInternalIdAdded, shouldUpdateId]);

    return (
        <ArrayContainer
            value={values.enumValues}
            name={enumValuesPath}
            buildEntry={buildEntry}
            disabled={false}
            onInternalIdAdded={setLastInternalIdAdded}
            small={true}
            includeAddButton={true}/>
    );
}

function EnumEntry({
                       index,
                       shouldUpdateId: updateId,
                       enumValuesPath,
                       autoFocus
                   }: {
    index: number,
    enumValuesPath: string,
    shouldUpdateId: boolean,
    autoFocus: boolean
}) {

    const {
        values,
        handleChange,
        errors,
        setFieldValue,
        touched
    } = useFormikContext<EnumValues>();

    const shouldUpdateIdRef = React.useRef(!getIn(values, `${enumValuesPath}[${index}].id`));
    const shouldUpdateId = updateId || shouldUpdateIdRef.current;

    const [dialogOpen, setDialogOpen] = React.useState(false);

    const idValue = getIn(values, `${enumValuesPath}[${index}].id`);
    const labelValue = getIn(values, `${enumValuesPath}[${index}].label`);

    const labelError = getIn(errors, `${enumValuesPath}[${index}].label`);

    const currentLabelRef = React.useRef(labelValue);

    React.useEffect(() => {
        if (currentLabelRef.current === idValue && shouldUpdateId) {
            setFieldValue(`${enumValuesPath}[${index}].id`, labelValue);
        }
        currentLabelRef.current = labelValue;
    }, [labelValue]);

    return (
        <Box display={"flex"} width={"100%"} alignItems={"center"}>
            <Box width={"100%"} mx={1}>
                <Field name={`${enumValuesPath}[${index}].label`}
                       as={DebouncedTextField}
                       required
                       fullWidth
                       size="small"
                       validate={validateLabel}
                       autoFocus={autoFocus}
                       autoComplete="off"
                       error={Boolean(labelError)}/>
            </Box>
            <Box>
                <IconButton
                    size="small"
                    aria-label="edit"
                    onClick={() => setDialogOpen(true)}>
                    <SettingsOutlinedIcon fontSize={"small"}/>
                </IconButton>
            </Box>
            <EnumEntryDialog index={index}
                             open={dialogOpen}
                             enumValuesPath={enumValuesPath}
                             onClose={() => setDialogOpen(false)}/>
        </Box>);
}

function EnumEntryDialog({
                             index,
                             open,
                             onClose,
                             enumValuesPath
                         }: {
    index: number;
    open: boolean;
    enumValuesPath: string;
    onClose: () => void;
}) {

    const {
        values,
        handleChange,
        errors,
        setFieldValue,
        touched
    } = useFormikContext<EnumValues>();

    const idError = getIn(errors, `${enumValuesPath}[${index}].id`);
    return <Dialog
        maxWidth="md"
        aria-labelledby="enum-edit-dialog"
        open={open}
        onBackdropClick={onClose}
    >

        <DialogContent>
            <FastField name={`${enumValuesPath}[${index}]id`}
                       as={DebouncedTextField}
                       required
                       fullWidth
                       validate={validateId}
                       label={"ID"}
                       helperText={idError ?? "Value saved in the data source"}
                       size="small"
                       autoComplete="off"
                       error={Boolean(idError)}/>
        </DialogContent>

        <CustomDialogActions>
            <Button
                autoFocus
                variant="contained"
                onClick={onClose}
                color="primary">
                Ok
            </Button>
        </CustomDialogActions>

    </Dialog>
}

function validateLabel(value: string) {
    let error;
    if (!value) {
        error = "You must specify a label";
    }
    return error;
}

function validateId(value: string) {
    let error;
    if (!value) {
        error = "You must specify an ID";
    }
    return error;
}
