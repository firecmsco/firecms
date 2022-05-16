import React, { useCallback, useEffect } from "react";

import { FastField, Formik, getIn, useFormikContext } from "formik";
import { Box, Button, Dialog, DialogContent, IconButton } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import {
    ArrayContainer,
    CustomDialogActions,
    DebouncedTextField,
    EnumValueConfig,
    EnumValues
} from "@camberi/firecms";

type EnumFormProps = {
    enumValues: EnumValueConfig[];
    onValuesChanged?: (enumValues: EnumValueConfig[]) => void;
    onError?: (error: boolean) => void;
    updateIds: boolean;
    disabled:boolean;
};
export
const EnumForm = React.memo(
    function EnumForm({
                                  enumValues,
                                  onValuesChanged,
                                  onError,
                                  updateIds,
                                  disabled
                              }: EnumFormProps) {

        return (
            <Formik initialValues={{ enumValues }}
                    // enableReinitialize={true}
                    validateOnMount={true}
                    onSubmit={(data: { enumValues: EnumValueConfig[] }, formikHelpers) => {
                    }}
            >
                {
                    ({ values, errors }) => {
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
                                               shouldUpdateId={updateIds}
                                               disabled={disabled}/>
                    }
                }
            </Formik>

        );

    }
,
    function areEqual(prevProps: EnumFormProps, nextProps: EnumFormProps) {
        return prevProps.enumValues.length === nextProps.enumValues.length;
    }
);

type EnumFormFieldsProps = {
    values: { enumValues: EnumValueConfig[] };
    errors: any;
    enumValuesPath: string;
    shouldUpdateId: boolean;
    disabled:boolean;
};

// const EnumFormFields = React.memo(
    function EnumFormFields({
                                        values,
                                        errors,
                                        disabled,
                                        enumValuesPath,
                                        shouldUpdateId
                                    }: EnumFormFieldsProps) {

        const [lastInternalIdAdded, setLastInternalIdAdded] = React.useState<number | undefined>();
        const [editDialogIndex, setEditDialogIndex] = React.useState<number | undefined>();

        const buildEntry = useCallback((index: number, internalId: number) => {
            const justAdded = lastInternalIdAdded === internalId;
            return <EnumEntry index={index}
                              disabled={disabled}
                              enumValuesPath={enumValuesPath}
                              autoFocus={justAdded}
                              shouldUpdateId={shouldUpdateId || justAdded}
                              onDialogOpen={() => setEditDialogIndex(index)}
                              key={`${internalId}`}/>;
        }, [enumValuesPath, lastInternalIdAdded, shouldUpdateId]);

        return (<>
                <ArrayContainer
                    value={values.enumValues}
                    name={enumValuesPath}
                    buildEntry={buildEntry}
                    disabled={disabled}
                    onInternalIdAdded={setLastInternalIdAdded}
                    small={true}
                    includeAddButton={true}/>

                <EnumEntryDialog index={editDialogIndex}
                                 open={editDialogIndex !== undefined}
                                 enumValuesPath={enumValuesPath}
                                 onClose={() => setEditDialogIndex(undefined)}/>
            </>
        );
    }
    // ,
    // function areEqual(prevProps: EnumFormFieldsProps, nextProps: EnumFormFieldsProps) {
    //     return prevProps.enumValuesPath === nextProps.enumValuesPath &&
    //         prevProps.shouldUpdateId === nextProps.shouldUpdateId;
    // });

type EnumEntryProps = {
    index: number,
    enumValuesPath: string,
    shouldUpdateId: boolean,
    autoFocus: boolean,
    onDialogOpen: () => void;
    disabled:boolean;
};
const EnumEntry = React.memo(
    function EnumEntryInternal({
                                   index,
                                   shouldUpdateId: updateId,
                                   enumValuesPath,
                                   autoFocus,
                                   onDialogOpen,
                                   disabled
                               }: EnumEntryProps) {

        const {
            values,
            handleChange,
            errors,
            setFieldValue,
            touched
        } = useFormikContext<EnumValues>();

        const shouldUpdateIdRef = React.useRef(!getIn(values, `${enumValuesPath}[${index}].id`));
        const shouldUpdateId = updateId || shouldUpdateIdRef.current;

        const idValue = getIn(values, `${enumValuesPath}[${index}].id`);
        const labelValue = getIn(values, `${enumValuesPath}[${index}].label`);

        const labelError = getIn(errors, `${enumValuesPath}[${index}].label`);

        const currentLabelRef = React.useRef(labelValue);

        React.useEffect(() => {
            if ((currentLabelRef.current === idValue || !idValue) && shouldUpdateId) {
                setFieldValue(`${enumValuesPath}[${index}].id`, labelValue);
            }
            currentLabelRef.current = labelValue;
        }, [labelValue]);

        return (
            <Box display={"flex"} width={"100%"} alignItems={"center"}>
                <Box width={"100%"} mx={1}>
                    <FastField name={`${enumValuesPath}[${index}].label`}
                               as={DebouncedTextField}
                               required
                               fullWidth
                               disabled={disabled}
                               size="small"
                               validate={validateLabel}
                               autoFocus={autoFocus}
                               autoComplete="off"
                               error={Boolean(labelError)}/>
                </Box>
                {!disabled && <Box>
                    <IconButton
                        size="small"
                        aria-label="edit"
                        onClick={() => onDialogOpen()}>
                        <SettingsOutlinedIcon fontSize={"small"}/>
                    </IconButton>
                </Box>}
            </Box>);
    },
    function areEqual(prevProps: EnumEntryProps, nextProps: EnumEntryProps) {
        return prevProps.index === nextProps.index &&
            prevProps.enumValuesPath === nextProps.enumValuesPath &&
            prevProps.shouldUpdateId === nextProps.shouldUpdateId &&
            prevProps.autoFocus === nextProps.autoFocus;
    }
);


function EnumEntryDialog({
                             index,
                             open,
                             onClose,
                             enumValuesPath
                         }: {
    index?: number;
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

    const idError = index !== undefined ? getIn(errors, `${enumValuesPath}[${index}].id`) : undefined;
    return <Dialog
        maxWidth="md"
        aria-labelledby="enum-edit-dialog"
        open={open}
        onBackdropClick={onClose}
    >

        <DialogContent>
            {index !== undefined &&
                <FastField name={`${enumValuesPath}[${index}]id`}
                           as={DebouncedTextField}
                           required
                           fullWidth
                           validate={validateId}
                           label={"ID"}
                           helperText={idError ?? "Value saved in the data source"}
                           size="small"
                           autoComplete="off"
                           error={Boolean(idError)}/>}
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
