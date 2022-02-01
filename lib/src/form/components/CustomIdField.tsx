import React, { useMemo } from "react";

import {
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select as MuiSelect,
    TextField as MuiTextField,
    Tooltip
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { ErrorMessage } from "formik";

import {
    Entity,
    EntitySchema,
    EntityStatus,
    EnumValueConfig,
    FireCMSContext
} from "../../models";
import { formStyles } from "../styles";
import {
    useClipboard,
    useFireCMSContext,
    useSnackbarController
} from "../../hooks";
import { useSchemaRegistry } from "../../hooks/useSchemaRegistry";
import { resolveEnum } from "../../core/utils";

export function CustomIdField<M, UserType>
({ schema, status, onChange, error, entity }: {
    schema: EntitySchema<M>,
    status: EntityStatus,
    onChange: (id: string) => void,
    error: boolean,
    entity: Entity<M> | undefined
}) {

    const classes = formStyles();
    const schemaRegistry = useSchemaRegistry();

    const disabled = status === "existing" || !schema.customId;
    const idSetAutomatically = status !== "existing" && !schema.customId;

    const enumValues: EnumValueConfig[] | undefined = useMemo(() => {
        if (!schema.customId || typeof schema.customId === "boolean")
            return undefined;
        return resolveEnum(schema.customId, schemaRegistry.enumConfigs);
    }, [schemaRegistry.enumConfigs, schema.customId]);

    const snackbarContext = useSnackbarController();
    const { copy } = useClipboard({
        onSuccess: (text) => snackbarContext.open({
            type: "success",
            message: `Copied ${text}`
        })
    });

    const appConfig: FireCMSContext<UserType> | undefined = useFireCMSContext();
    const inputProps = {
        sx: {
            minHeight: "64px"
        },
        endAdornment: entity
? (
            <InputAdornment position="end">

                <IconButton onClick={(e) => copy(entity.id)}
                            aria-label="copy-id"
                            size="large">
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

                {appConfig?.entityLinkBuilder &&
                <a href={appConfig.entityLinkBuilder({ entity })}
                   rel="noopener noreferrer"
                   target="_blank">
                    <IconButton onClick={(e) => e.stopPropagation()}
                                aria-label="go-to-datasource" size="large">
                        <Tooltip title={"Open in the console"}>
                            <OpenInNewIcon fontSize={"small"}/>
                        </Tooltip>
                    </IconButton>
                </a>}

            </InputAdornment>
        )
: undefined
    };

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

            {enumValues &&
                <>
                    <InputLabel id={"id-label"}>{fieldProps.label}</InputLabel>
                    <MuiSelect
                        labelId={"id-label"}
                        className={classes.select}
                        error={error}
                        {...fieldProps}
                        onChange={(event: any) => onChange(event.target.value)}>
                        {enumValues.map((enumConfig) =>
                            <MenuItem
                                key={`custom-id-item-${enumConfig.id}`}
                                value={enumConfig.id}>
                                {`${enumConfig.id} - ${enumConfig.label}`}
                            </MenuItem>)}
                    </MuiSelect>
                </>}

            {!enumValues &&
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

