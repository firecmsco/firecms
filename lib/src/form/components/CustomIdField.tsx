import React, { useMemo } from "react";

import { styled } from "@mui/material/styles";

import {
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select as MuiSelect,
    TextField as MuiTextField,
    Theme,
    Tooltip
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { ErrorMessage } from "formik";

import {
    Entity,
    EntityStatus,
    EnumValueConfig,
    EnumValues,
    FireCMSContext
} from "../../types";

import {
    useClipboard,
    useFireCMSContext,
    useSnackbarController
} from "../../hooks";
import { resolveEnumValues } from "../../core/util/resolutions";

const PREFIX = "CustomIdField";

const classes = {
    input: `${PREFIX}-input`,
    select: `${PREFIX}-select`
};

const StyledFormControl = styled(FormControl)((
    { theme }: {
        theme: Theme
    }
) => ({
    marginBottom: "16px",
    [`& .${classes.input}`]: {
        minHeight: "64px"
    },

    [`& .${classes.select}`]: {
        paddingTop: theme.spacing(1 / 2)
    }
}));

export function CustomIdField<M extends Record<string, any>, UserType>({
                                                                           customId,
                                                                           entityId,
                                                                           status,
                                                                           onChange,
                                                                           error,
                                                                           entity
                                                                       }: {
    customId?: boolean | EnumValues | "optional"
    entityId?: string
    status: EntityStatus,
    onChange: (id?: string) => void,
    error: boolean,
    entity: Entity<M> | undefined
}) {

    const disabled = status === "existing" || !customId;
    const idSetAutomatically = status !== "existing" && !customId;

    const enumValues: EnumValueConfig[] | undefined = useMemo(() => {
        if (!customId || typeof customId === "boolean" || customId === "optional")
            return undefined;
        return resolveEnumValues(customId);
    }, [customId]);

    const snackbarController = useSnackbarController();
    const { copy } = useClipboard({
        onSuccess: (text) => snackbarController.open({
            type: "success",
            message: `Copied ${text}`
        })
    });

    const appConfig: FireCMSContext | undefined = useFireCMSContext();
    const inputProps = {
        sx: (theme:Theme) => ({
            minHeight: "64px",
            borderRadius: `${theme.shape.borderRadius}px`
        }),
        disableUnderline: true,
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
                                        aria-label="go-to-datasource"
                                        size="large">
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
        label: idSetAutomatically ? "ID is set automatically" : "ID",
        disabled,
        name: "id",
        type: null,
        value: (entity && status === "existing" ? entity.id : entityId) ?? "",
        variant: "filled",
        sx: (theme:Theme) => ({
            minHeight: "64px",
            borderRadius: `${theme.shape.borderRadius}px`
        })
    };

    return (
        <StyledFormControl fullWidth
                           error={error}
                           {...fieldProps}
                           key={"custom-id-field"}>

            {enumValues &&
                <>
                    <InputLabel id={"id-label"}>{fieldProps.label}</InputLabel>
                    <MuiSelect
                        labelId={"id-label"}
                        fullWidth
                        className={classes.select}
                        disableUnderline={true}
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
                              helperText={customId === "optional" ? "Autogenerated ID, it can be manually changed" : (status === "new" || status === "copy" ? "ID of the new document" : "ID of the document")}
                              onChange={(event) => {
                                  let value = event.target.value;
                                  if (value) value = value.trim();
                                  return onChange(value.length ? value : undefined);
                              }}/>}

            <ErrorMessage name={"id"}
                          component="div">
                {(_) => "You need to specify an ID"}
            </ErrorMessage>

        </StyledFormControl>
    );
}
