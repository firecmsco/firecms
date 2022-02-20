import React, { useCallback } from "react";

import { FastField, Formik, getIn, useFormikContext } from "formik";
import * as Yup from "yup";
import { Box, Button, Dialog, DialogContent, IconButton } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";

import { useDebounce } from "../../internal/useDebounce";
import DebouncedTextField from "../../../form/components/DebouncedTextField";
import { EnumValueConfig, EnumValues } from "../../../models";
import { ArrayContainer } from "../../../form";
import { CustomDialogActions } from "../CustomDialogActions";

export function EnumForm({
                             enumValues,
                             onValuesChanged,
                             updateIds
                         }: {
    enumValues: EnumValueConfig[];
    onValuesChanged?: (enumValues: EnumValueConfig[]) => void;
    updateIds: boolean;
}) {

    const [lastInternalIdAdded, setLastInternalIdAdded] = React.useState<number | undefined>();
    const schema = Yup.object().shape({
        enumValues: Yup.array()
            .of(
                Yup.object().shape({
                    label: Yup.string().required("Required"),
                    id: Yup.string().required("Required")
                })
            )
            .required("Required")
            .min(1, "Must have at least one entry")
    });

    return (
        <Formik initialValues={{ enumValues }}
                validationSchema={schema}
                onSubmit={(data: { enumValues: EnumValueConfig[] }, formikHelpers) => {
                }}
                render={({ values }) => {

                    // eslint-disable-next-line react-hooks/rules-of-hooks
                    const doUpdate = useCallback(() => {
                        if (onValuesChanged) {
                            onValuesChanged(values.enumValues);
                        }
                    }, [values.enumValues]);
// eslint-disable-next-line react-hooks/rules-of-hooks
                    useDebounce(values.enumValues, doUpdate, 100);

                    const buildEntry = (index: number, internalId: number) => {

                        return <EnumEntry index={index}
                                          autoFocus={lastInternalIdAdded === internalId}
                                          updateId={updateIds}
                                          key={`${internalId}`}/>;
                    };

                    return (
                        <ArrayContainer
                            value={values.enumValues}
                            name={"enumValues"}
                            buildEntry={buildEntry}
                            disabled={false}
                            onInternalIdAdded={setLastInternalIdAdded}
                            small={true}
                            includeAddButton={true}/>
                    );
                }}
        />

    );

}

function EnumEntry({
                       index,
                       updateId,
                       autoFocus
                   }: { index: number, updateId: boolean, autoFocus: boolean }) {

    const {
        values,
        handleChange,
        errors,
        setFieldValue,
        touched
    } = useFormikContext<EnumValues>();

    const shouldUpdateIdRef = React.useRef(!getIn(values, `enumValues[${index}].id`));
    const shouldUpdateId = updateId || shouldUpdateIdRef.current;

    const [dialogOpen, setDialogOpen] = React.useState(false);

    const idValue = getIn(values, `enumValues[${index}].id`);
    const labelValue = getIn(values, `enumValues[${index}].label`);

    const labelError = getIn(errors, `enumValues[${index}].label`);

    const currentLabelRef = React.useRef(labelValue);

    React.useEffect(() => {
        if (currentLabelRef.current === idValue && shouldUpdateId) {
            setFieldValue(`enumValues[${index}].id`, labelValue);
        }
        currentLabelRef.current = labelValue;
    }, [labelValue]);

    return (
        <Box display={"flex"} width={"100%"} alignItems={"center"}>
            <Box width={"100%"} mx={1}>
                <FastField name={`enumValues[${index}].label`}
                           as={DebouncedTextField}
                           required
                           fullWidth
                           helperText={labelError}
                           size="small"
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
                             onClose={() => setDialogOpen(false)}/>
        </Box>);
}

function EnumEntryDialog({
                             index,
                             open,
                             onClose
                         }: {
    index: number;
    open: boolean;
    onClose: () => void;
}) {

    const {
        values,
        handleChange,
        errors,
        setFieldValue,
        touched
    } = useFormikContext<EnumValues>();

    const idError = getIn(errors, `enumValues[${index}].id`);
    return <Dialog
        maxWidth="md"
        aria-labelledby="enum-edit-dialog"
        open={open}
        onBackdropClick={onClose}
    >

        <DialogContent>
            <FastField name={`enumValues[${index}]id`}
                       as={DebouncedTextField}
                       required
                       fullWidth
                       label={"ID"}
                       helperText={idError ?? "Value saved in the data source"}
                       size="small"
                       autoComplete="off"
                       error={Boolean(idError)}/>
        </DialogContent>

        <CustomDialogActions>
            <Button
                autoFocus
                onClick={onClose}
                color="primary">
                Ok
            </Button>
        </CustomDialogActions>

    </Dialog>
}
