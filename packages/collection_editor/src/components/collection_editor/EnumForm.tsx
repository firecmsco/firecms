import React, { useEffect } from "react";

import { FastField, Formik, getIn, useFormikContext } from "formik";
import {
    AutoAwesomeIcon,
    Button,
    CircularProgress,
    DebouncedTextField,
    Dialog,
    DialogActions,
    DialogContent,
    EnumValueConfig,
    EnumValues,
    FormikArrayContainer,
    IconButton,
    ListIcon,
    Paper,
    SettingsIcon,
    Typography
} from "@firecms/core";
import { FieldHelperView } from "./properties/FieldHelperView";
import { extractEnumFromValues } from "@firecms/schema_inference";

type EnumFormProps = {
    enumValues: EnumValueConfig[];
    onValuesChanged?: (enumValues: EnumValueConfig[]) => void;
    onError?: (error: boolean) => void;
    updateIds: boolean;
    disabled: boolean;
    allowDataInference?: boolean;
    getData?: () => Promise<string[]>;
};
export const EnumForm = React.memo(
    function EnumForm({
                          enumValues,
                          onValuesChanged,
                          onError,
                          updateIds,
                          disabled,
                          allowDataInference,
                          getData
                      }: EnumFormProps) {

        return (
            <Formik initialValues={{ enumValues }}
                // enableReinitialize={true}
                    validateOnMount={true}
                    onSubmit={(data: { enumValues: EnumValueConfig[] }, formikHelpers) => {
                    }}
            >
                {
                    ({
                         values,
                         errors
                     }) => {
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
                                               disabled={disabled}
                                               allowDataInference={allowDataInference}
                                               getData={getData}/>
                    }
                }
            </Formik>

        );
    },
    function areEqual(prevProps: EnumFormProps, nextProps: EnumFormProps) {
        return prevProps.enumValues.length === nextProps.enumValues.length &&
            prevProps.onValuesChanged === nextProps.onValuesChanged &&
            prevProps.getData === nextProps.getData
            ;
    }
);

type EnumFormFieldsProps = {
    values: { enumValues: EnumValueConfig[] };
    errors: any;
    enumValuesPath: string;
    shouldUpdateId: boolean;
    disabled: boolean;
    getData?: () => Promise<string[]>;
    allowDataInference?: boolean;
};

// const EnumFormFields = React.memo(
function EnumFormFields({
                            values,
                            errors,
                            disabled,
                            enumValuesPath,
                            shouldUpdateId,
                            allowDataInference,
                            getData,
                        }: EnumFormFieldsProps) {

    const {
        setFieldValue
    } = useFormikContext();

    const [lastInternalIdAdded, setLastInternalIdAdded] = React.useState<number | undefined>();
    const [editDialogIndex, setEditDialogIndex] = React.useState<number | undefined>();
    const [inferring, setInferring] = React.useState(false);

    const inferredValuesRef = React.useRef(new Set());
    const inferredValues = inferredValuesRef.current;

    const buildEntry = (index: number, internalId: number) => {
        const justAdded = lastInternalIdAdded === internalId;
        return <EnumEntry index={index}
                          disabled={disabled}
                          enumValuesPath={enumValuesPath}
                          autoFocus={justAdded}
                          shouldUpdateId={shouldUpdateId || justAdded}
                          onDialogOpen={() => setEditDialogIndex(index)}
                          inferredEntry={inferredValues.has(values.enumValues[index]?.id as string)}
                          key={`${internalId}`}/>;
    };

    const inferValues = async () => {
        if (!getData)
            return;
        setInferring(true);
        getData?.().then((data) => {
            if (!data)
                return;

            const flatData = data.flat();

            const fieldData = Array.from(new Set(flatData));

            const currentEnumValues = values.enumValues;
            const foundEnumValues = extractEnumFromValues(fieldData);

            // add only new enum values
            const newEnumValues = foundEnumValues.filter((enumValue) => {
                return !currentEnumValues?.some((v: any) => v.id === enumValue.id);
            });

            newEnumValues.forEach((enumValue) => {
                inferredValues.add(enumValue.id);
            });
            setFieldValue(enumValuesPath, [...newEnumValues, ...currentEnumValues]);
        }).catch(e => {
            console.error(e);
        })
            .finally(() => setInferring(false));
    }

    return (
        <div className={"col-span-12"}>
            <div className="ml-3.5 flex flex-row items-center">
                <ListIcon/>
                <Typography variant={"subtitle2"}
                            className="ml-2 grow">
                    Values
                </Typography>
                {allowDataInference &&
                    <Button loading={inferring}
                            disabled={disabled || inferring}
                            variant={"text"}
                            size={"small"}
                            onClick={inferValues}>
                        {inferring ? <CircularProgress size={"small"}/> : <AutoAwesomeIcon/>}
                        Infer values from data
                    </Button>}
            </div>

            <Paper className="p-4 m-1">

                <FormikArrayContainer
                    value={values.enumValues}
                    addLabel={"Add enum value"}
                    name={enumValuesPath}
                    buildEntry={buildEntry}
                    disabled={disabled}
                    onInternalIdAdded={setLastInternalIdAdded}
                    small={true}
                    setFieldValue={setFieldValue}
                    includeAddButton={true}/>

                <EnumEntryDialog index={editDialogIndex}
                                 open={editDialogIndex !== undefined}
                                 enumValuesPath={enumValuesPath}
                                 onClose={() => setEditDialogIndex(undefined)}/>
            </Paper>
        </div>
    );
}

type EnumEntryProps = {
    index: number,
    enumValuesPath: string,
    shouldUpdateId: boolean,
    autoFocus: boolean,
    onDialogOpen: () => void;
    disabled: boolean;
    inferredEntry?: boolean;
};

const EnumEntry = React.memo(
    function EnumEntryInternal({
                                   index,
                                   shouldUpdateId: updateId,
                                   enumValuesPath,
                                   autoFocus,
                                   onDialogOpen,
                                   disabled,
                                   inferredEntry
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
            <div className={"flex w-full align-center justify-center"}>
                <FastField name={`${enumValuesPath}[${index}].label`}
                           as={DebouncedTextField}
                           className={"flex-grow"}
                           required
                           disabled={disabled}
                           size="small"
                           validate={validateLabel}
                           autoFocus={autoFocus}
                           autoComplete="off"
                           endAdornment={inferredEntry && <AutoAwesomeIcon size={"small"}/>}
                           error={Boolean(labelError)}/>

                {!disabled &&
                    <IconButton
                        size="small"
                        aria-label="edit"
                        className={"m-1"}
                        onClick={() => onDialogOpen()}>
                        <SettingsIcon size={"small"}/>
                    </IconButton>}

            </div>);
    },
    function areEqual(prevProps: EnumEntryProps, nextProps: EnumEntryProps) {
        return prevProps.index === nextProps.index &&
            prevProps.enumValuesPath === nextProps.enumValuesPath &&
            prevProps.shouldUpdateId === nextProps.shouldUpdateId &&
            prevProps.inferredEntry === nextProps.inferredEntry &&
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
        onOpenChange={(open) => !open ? onClose() : undefined}
    >

        <DialogContent>
            {index !== undefined &&
                <div><FastField name={`${enumValuesPath}[${index}]id`}
                                as={DebouncedTextField}
                                required
                                validate={validateId}
                                label={"ID"}
                                size="small"
                                autoComplete="off"
                                error={Boolean(idError)}/>

                    <FieldHelperView error={Boolean(idError)}>
                        {idError ?? "Value saved in the data source"}
                    </FieldHelperView>
                </div>}
        </DialogContent>

        <DialogActions>
            <Button
                autoFocus
                variant="outlined"
                onClick={onClose}
                color="primary">
                Ok
            </Button>
        </DialogActions>

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
