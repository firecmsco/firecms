import React from "react";

import { useClipboard } from "use-clipboard-hook";
import {
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select as MuiSelect,
    TextField as MuiTextField,
    Tooltip
} from "@material-ui/core";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

import { ErrorMessage } from "formik";

import { Entity, EntitySchema, EntityStatus } from "../models";
import { useCMSAppContext, useSnackbarController } from "../contexts";
import { CMSAppContext } from "../contexts/CMSAppContext";
import { formStyles } from "./styles";


export function CustomIdField<M>
({ schema, status, onChange, error, entity }: {
    schema: EntitySchema<M>,
    status: EntityStatus,
    onChange: Function,
    error: boolean,
    entity: Entity<M> | undefined
}) {

    const classes = formStyles();

    const disabled = status === "existing" || !schema.customId;
    const idSetAutomatically = status !== "existing" && !schema.customId;

    const hasEnumValues = typeof schema.customId === "object";

    const snackbarContext = useSnackbarController();
    const { ref, copy, cut } = useClipboard({
        onSuccess: (text) => snackbarContext.open({
            type: "success",
            message: `Copied ${text}`
        })
    });

    const appConfig: CMSAppContext | undefined = useCMSAppContext();
    const inputProps = entity ? {
        className: classes.input,
            endAdornment: (
                <InputAdornment position="end">

                    <IconButton onClick={(e) => copy(entity.id)}
                                aria-label="copy-id" size="large">
                        <Tooltip title={"Copy"}>
                            <svg
                                className={"MuiSvgIcon-root MuiSvgIcon-fontSizeSmall"}
                                fill={"currentColor"}
                                width="20" height="20" viewBox="0 0 24 24">
                                <path
                                    d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                        </Tooltip>
                    </IconButton>

                    {appConfig?.firebaseConfig &&
                    <a href={`https://console.firebase.google.com/project/${(appConfig.firebaseConfig as any)["projectId"]}/firestore/data/${entity.reference.path}`}
                       rel="noopener noreferrer"
                       target="_blank">
                        <IconButton onClick={(e) => e.stopPropagation()}
                                    aria-label="go-to-firestore" size="large">
                            <Tooltip title={"Open in Firestore console"}>
                                <OpenInNewIcon fontSize={"small"}/>
                            </Tooltip>
                        </IconButton>
                    </a>}

                </InputAdornment>
            )
        } :
        undefined;

    const fieldProps: any = {
        label: idSetAutomatically ? "Id is set automatically" : "Id",
        disabled: disabled,
        name: "id",
        type: null,
        value: entity && status === "existing" ? entity.id : undefined,
        variant: "filled"
    };
    return (
        <FormControl fullWidth
                     error={error}
                     {...fieldProps}
                     key={"custom-id-field"}>

            {hasEnumValues && schema.customId &&
            <>
                <InputLabel id={`id-label`}>{fieldProps.label}</InputLabel>
                <MuiSelect
                    labelId={`id-label`}
                    className={classes.select}
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
            </>}

            {!hasEnumValues &&
            <MuiTextField {...fieldProps}
                          error={error}
                          InputProps={inputProps}
                          onChange={(event) => {
                              let value = event.target.value;
                              if (value) value = value.trim();
                              return onChange(value);
                          }}/>}

            <ErrorMessage name={"id"}
                          component="div">
                {(_) => "You need to specify an ID"}
            </ErrorMessage>

        </FormControl>
    );
}

