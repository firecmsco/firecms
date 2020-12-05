import React from "react";
import {
    FormControl,
    FormHelperText,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select as MuiSelect,
    TextField as MuiTextField,
    Tooltip
} from "@material-ui/core";
import { Entity, EntitySchema, EntityStatus, Property } from "../models";
import { ErrorMessage, FastField, FieldProps } from "formik";

import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import Select from "./fields/Select";
import ArrayEnumSelect from "./fields/ArrayEnumSelect";
import StorageUploadField from "./fields/StorageUploadField";
import TextField from "./fields/TextField";
import SwitchField from "./fields/SwitchField";
import DateTimeField from "./fields/DateTimeField";
import ReferenceField from "./fields/ReferenceField";
import MapField from "./fields/MapField";
import ArrayDefaultField from "./fields/ArrayDefaultField";
import ArrayMapField from "./fields/ArrayMapField";
import DisabledField from "./fields/DisabledField";
import { CMSFieldProps } from "./form_props";
import ArrayShapedField from "./fields/ArrayShapedField";
import { useClipboard } from "use-clipboard-hook";
import { useSnackbarContext } from "../contexts/SnackbarContext";
import MarkDownField from "./fields/MarkdownField";
import { useAppConfigContext } from "../contexts/AppConfigContext";
import { CMSAppProps } from "../CMSAppProps";

export interface FormFieldProps {
    name: string,
    property: Property,
    includeDescription: boolean,
    underlyingValueHasChanged: boolean,
    entitySchema: EntitySchema,
    partOfArray: boolean,
}

export function createFormField<T>({
                                       name,
                                       property,
                                       includeDescription,
                                       underlyingValueHasChanged,
                                       entitySchema,
                                       partOfArray
                                   }: FormFieldProps): JSX.Element {

    if (property.disabled) {
        return buildFieldInternal(name, property, includeDescription, DisabledField, underlyingValueHasChanged, entitySchema, partOfArray);
    }

    let component: React.ComponentType<CMSFieldProps<T>> | undefined;

    if (property.config?.field) {
        component = property.config?.field;
    } else if (property.dataType === "array") {

        if ("dataType" in property.of) {
            if ((property.of.dataType === "string" || property.of.dataType === "number") && property.of.config?.enumValues) {
                component = ArrayEnumSelect;
            } else if (property.of.dataType === "string" && property.of.config?.storageMeta) {
                component = StorageUploadField;
            } else {
                component = ArrayDefaultField;
            }
        } else if (Array.isArray(property.of)) {
            component = ArrayShapedField;
        }
    } else if (property.dataType === "map") {
        component = MapField;
    } else if (property.dataType === "reference") {
        component = ReferenceField;
    } else if (property.dataType === "timestamp") {
        component = DateTimeField;
    } else if (property.dataType === "boolean") {
        component = SwitchField;
    } else if (property.dataType === "number") {
        if (property.config?.enumValues) {
            component = Select;
        } else {
            component = TextField;
        }
    } else if (property.dataType === "string") {
        if (property.config?.storageMeta) {
            component = StorageUploadField;
        } else if (property.config?.markdown) {
            component = MarkDownField;
        } else if (property.config?.enumValues) {
            component = Select;
        } else {
            component = TextField;
        }
    }
    if (component)
        return buildFieldInternal(name, property, includeDescription, component, underlyingValueHasChanged, entitySchema, partOfArray);

    return (
        <div>{`Currently the field ${property.dataType} is not supported`}</div>
    );
}

function buildFieldInternal<P extends Property<T>, T = any>(name: string,
                                                            property: P,
                                                            includeDescription: boolean,
                                                            component: React.ComponentType<CMSFieldProps<T>>,
                                                            underlyingValueHasChanged: boolean,
                                                            entitySchema: EntitySchema,
                                                            partOfArray: boolean
) {

    const additionalFieldProps: any = property.config?.fieldProps;

    return (
        <FastField
            required={property.validation?.required}
            name={`${name}`}
        >
            {(fieldProps: FieldProps<T>) => (
                <React.Fragment>

                    {React.createElement(component, {
                        ...fieldProps,
                        ...additionalFieldProps,
                        name: fieldProps.field.name,
                        includeDescription,
                        property,
                        createFormField,
                        underlyingValueHasChanged,
                        entitySchema,
                        partOfArray
                    })}

                    {underlyingValueHasChanged && !fieldProps.form.isSubmitting &&
                    <FormHelperText>
                        This value has been updated in Firestore
                    </FormHelperText>}

                </React.Fragment>)
            }

        </FastField>);
}


export function createCustomIdField<S extends EntitySchema>(schema: EntitySchema, formType: EntityStatus, onChange: Function, error: boolean, entity: Entity<S> | undefined) {

    const disabled = formType !== EntityStatus.new || !schema.customId;

    const hasEnumValues = typeof schema.customId === "object";

    const snackbarContext = useSnackbarContext();
    const { ref, copy, cut } = useClipboard({
        onSuccess: (text) => snackbarContext.open({
            type: "success",
            message: `Copied ${text}`
        })
    });

    const appConfig: CMSAppProps | undefined = useAppConfigContext();
    const inputProps = entity ? {
            endAdornment: (<InputAdornment position="end">
                    <IconButton
                        onClick={(e) => copy(entity.id)}
                        aria-label="copy-id">
                        <Tooltip title={"Copy"}>
                            <svg
                                className={"MuiSvgIcon-root MuiSvgIcon-fontSizeSmall"}
                                width="20" height="20" viewBox="0 0 24 24">
                                <path
                                    d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                        </Tooltip>
                    </IconButton>
                    {appConfig?.firebaseConfig &&
                    <a href={`https://console.firebase.google.com/project/${appConfig.firebaseConfig["projectId"]}/firestore/data/${entity.reference.path}`}
                       rel="noopener noreferrer"
                       target="_blank">
                        <IconButton
                            aria-label="go-to-firestore">
                            <Tooltip title={"Open in Firestore console"}>
                                <OpenInNewIcon
                                    fontSize={"small"}/>
                            </Tooltip>
                        </IconButton>
                    </a>}
                </InputAdornment>
            )
        } :
        undefined;

    const fieldProps: any = {
        label: (formType === EntityStatus.new && disabled) ? "Id is set automatically" : "Id",
        disabled: disabled,
        name: "id",
        type: null,
        value: entity ? entity.id : undefined,
        variant: "filled"
    };
    return (
        <FormControl fullWidth error={error}
                     {...fieldProps}
                     key={"custom-id-field"}>

            {hasEnumValues && schema.customId &&
            <React.Fragment>
                <InputLabel id={`id-label`}>{fieldProps.label}</InputLabel>
                <MuiSelect
                    labelId={`id-label`}
                    error={error}
                    {...fieldProps}
                    onChange={(event: any) => onChange(event.target.value)}>
                    {Object.entries(schema.customId).map(([key, label]) =>
                        <MenuItem
                            key={`custom-id-item-${key}`}
                            value={key}>
                            {`${key} - ${label}`}
                        </MenuItem>)}
                </MuiSelect>
            </React.Fragment>}

            {!hasEnumValues &&
            <MuiTextField {...fieldProps}
                          error={error}
                          InputProps={inputProps}
                          onChange={(event) => onChange(event.target.value)}/>}

            <ErrorMessage name={"id"}
                          component="div">{(_) => "You need to specify an ID"}</ErrorMessage>

        </FormControl>
    );
}

export {
    ArrayDefaultField,
    ArrayEnumSelect,
    ArrayMapField,
    DateTimeField,
    DisabledField,
    MapField,
    ReferenceField,
    Select,
    StorageUploadField,
    SwitchField,
    TextField
};

