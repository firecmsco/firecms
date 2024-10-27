import React, { useEffect } from "react";
import equal from "react-fast-compare"

import { ArrayContainer, ArrayEntryParams, EnumValueConfig, EnumValues, FieldCaption, } from "@firecms/core";
import {
    AutoAwesomeIcon,
    Badge,
    Button,
    CircularProgress,
    DebouncedTextField,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    ListIcon,
    Paper,
    SettingsIcon,
    Typography
} from "@firecms/ui";
import { extractEnumFromValues } from "@firecms/schema_inference";
import { Field, Formex, getIn, useCreateFormex, useFormex } from "@firecms/formex";

type EnumFormProps = {
    enumValues: EnumValueConfig[];
    onValuesChanged?: (enumValues: EnumValueConfig[]) => void;
    onError?: (error: boolean) => void;
    updateIds: boolean;
    disabled: boolean;
    allowDataInference?: boolean;
    getData?: () => Promise<string[]>;
};

export function EnumForm({
                             enumValues,
                             onValuesChanged,
                             onError,
                             updateIds,
                             disabled,
                             allowDataInference,
                             getData
                         }: EnumFormProps) {

    const formex = useCreateFormex<{
        enumValues: EnumValueConfig[]
    }>({
        initialValues: { enumValues },
        validateOnChange: true,
        validation: (values) => {
            const errors: any = {};
            if (values.enumValues) {
                values.enumValues.forEach((enumValue, index) => {
                    if (!enumValue?.label) {
                        errors.enumValues = errors.enumValues ?? [];
                        errors.enumValues[index] = errors.enumValues[index] ?? {};
                        errors.enumValues[index].label = "You must specify a label for this enum value entry";
                    }
                    if (!enumValue?.id) {
                        errors.enumValues = errors.enumValues ?? [];
                        errors.enumValues[index] = errors.enumValues[index] ?? {};
                        errors.enumValues[index].id = "You must specify an ID for this enum value entry";
                    }
                });
            }
            const hasError = Boolean(errors?.enumValues && Object.keys(errors?.enumValues).length > 0);
            onError?.(hasError);
            return errors;
        }
    });

    const { values, errors } = formex;

    useEffect(() => {
        if (onValuesChanged) {
            onValuesChanged(values.enumValues);
        }
    }, [values.enumValues]);

    return <Formex value={formex}>
        <EnumFormFields enumValuesPath={"enumValues"}
                        values={values}
                        errors={errors}
                        shouldUpdateId={updateIds}
                        disabled={disabled}
                        allowDataInference={allowDataInference}
                        getData={getData}/>
    </Formex>

}

type EnumFormFieldsProps = {
    values: {
        enumValues: EnumValueConfig[]
    };
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
    } = useFormex();

    const [lastInternalIdAdded, setLastInternalIdAdded] = React.useState<number | undefined>();
    const [editDialogIndex, setEditDialogIndex] = React.useState<number | undefined>();
    const [inferring, setInferring] = React.useState(false);

    const inferredValuesRef = React.useRef(new Set());
    const inferredValues = inferredValuesRef.current;

    const buildEntry = ({
                            index,
                            internalId
                        }:ArrayEntryParams) => {
        const justAdded = lastInternalIdAdded === internalId;
        const entryError = errors?.enumValues && errors?.enumValues[index];
        return <EnumEntry index={index}
                          disabled={disabled}
                          enumValuesPath={enumValuesPath}
                          autoFocus={justAdded}
                          entryError={entryError}
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
            setFieldValue(enumValuesPath, [...newEnumValues, ...currentEnumValues], true);
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

                <ArrayContainer droppableId={enumValuesPath}
                                addLabel={"Add enum value"}
                                value={values.enumValues}
                                disabled={disabled}
                                size={"small"}
                                buildEntry={buildEntry}
                                onInternalIdAdded={setLastInternalIdAdded}
                                includeAddButton={true}
                                onValueChange={(value) => setFieldValue(enumValuesPath, value)}
                                newDefaultEntry={{ id: "", label: "" }}/>

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
    entryError?: { label?: string, id?: string }
};

const EnumEntry = React.memo(
    function EnumEntryInternal({
                                   index,
                                   shouldUpdateId: updateId,
                                   enumValuesPath,
                                   autoFocus,
                                   onDialogOpen,
                                   disabled,
                                   inferredEntry,
                                   entryError
                               }: EnumEntryProps) {

        const {
            values,
            handleChange,
            errors,
            setFieldValue,
            touched
        } = useFormex<EnumValues>();

        const shouldUpdateIdRef = React.useRef(!getIn(values, `${enumValuesPath}[${index}].id`));
        const shouldUpdateId = updateId || shouldUpdateIdRef.current;

        const idValue = getIn(values, `${enumValuesPath}[${index}].id`);
        const labelValue = getIn(values, `${enumValuesPath}[${index}].label`);

        const currentLabelRef = React.useRef(labelValue);

        React.useEffect(() => {
            if ((currentLabelRef.current === idValue || !idValue) && shouldUpdateId) {
                setFieldValue(`${enumValuesPath}[${index}].id`, labelValue);
            }
            currentLabelRef.current = labelValue;
        }, [labelValue]);

        return (
            <>
                <div className={"flex w-full align-center justify-center"}>
                    <Field name={`${enumValuesPath}[${index}].label`}
                           as={DebouncedTextField}
                           className={"flex-grow"}
                           required
                           disabled={disabled}
                           size="small"
                           autoFocus={autoFocus}
                           autoComplete="off"
                           endAdornment={inferredEntry && <AutoAwesomeIcon size={"small"}/>}
                           error={Boolean(entryError?.label)}/>

                    {!disabled &&
                        <Badge color={"error"} invisible={!entryError?.id}>
                            <IconButton
                                size="small"
                                aria-label="edit"
                                className={"m-1"}
                                onClick={() => onDialogOpen()}>
                                <SettingsIcon size={"small"}/>
                            </IconButton>
                        </Badge>}

                </div>

                {entryError?.label && <Typography variant={"caption"}
                                                  className={"ml-3.5 text-red-500 dark:text-red-500"}>
                    {entryError?.label}
                </Typography>}

                {entryError?.id && <Typography variant={"caption"}
                                               className={"ml-3.5 text-red-500 dark:text-red-500"}>
                    {entryError?.id}
                </Typography>}

            </>);
    },
    function areEqual(prevProps: EnumEntryProps, nextProps: EnumEntryProps) {
        return prevProps.index === nextProps.index &&
            prevProps.enumValuesPath === nextProps.enumValuesPath &&
            prevProps.shouldUpdateId === nextProps.shouldUpdateId &&
            prevProps.inferredEntry === nextProps.inferredEntry &&
            equal(prevProps.entryError, nextProps.entryError) &&
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
        errors,
    } = useFormex<EnumValues>();

    const idError = index !== undefined ? getIn(errors, `${enumValuesPath}[${index}].id`) : undefined;
    return <Dialog
        maxWidth="md"
        aria-labelledby="enum-edit-dialog"
        open={open}
        onOpenChange={(open) => !open ? onClose() : undefined}
    >

        <DialogContent>
            {index !== undefined &&
                <div>
                    <Field name={`${enumValuesPath}[${index}].id`}
                           as={DebouncedTextField}
                           required
                           label={"ID"}
                           size="small"
                           autoComplete="off"
                           error={Boolean(idError)}/>

                    <FieldCaption error={Boolean(idError)}>
                        {idError ?? "Value saved in the data source"}
                    </FieldCaption>
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

