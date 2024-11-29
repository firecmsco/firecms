import React, { useMemo } from "react";

// import { ErrorMessage } from "@firecms/formex";
import { Entity, EntityStatus, EnumValueConfig, EnumValues } from "../../types";

import { useClipboard, useSnackbarController } from "../../hooks";
import { enumToObjectEntries } from "../../util";
import {
    CircularProgress,
    ContentCopyIcon,
    IconButton,
    OpenInNewIcon,
    Select,
    SelectItem,
    TextField,
    Tooltip,
    Typography
} from "@firecms/ui";
import { EnumValuesChip } from "../../preview";
import { useCustomizationController } from "../../hooks/useCustomizationController";
import { CustomizationController } from "../../types/customization_controller";
import { useFormex } from "@firecms/formex";

export function CustomIdField<M extends Record<string, any>>({
                                                                 customId,
                                                                 entityId,
                                                                 status,
                                                                 onChange,
                                                                 error,
                                                                 entity,
                                                                 loading
                                                             }: {
    customId?: boolean | EnumValues | "optional"
    entityId?: string
    status: EntityStatus,
    onChange: (id?: string) => void,
    error: boolean,
    entity: Entity<M> | undefined,
    loading: boolean
}) {

    const { errors } = useFormex();
    const disabled = status === "existing" || !customId;
    const idSetAutomatically = status !== "existing" && !customId;

    const enumValues: EnumValueConfig[] | undefined = useMemo(() => {
        if (!customId || typeof customId === "boolean" || customId === "optional")
            return undefined;
        return enumToObjectEntries(customId);
    }, [customId]);

    const snackbarController = useSnackbarController();
    const { copy } = useClipboard({
        onSuccess: (text) => snackbarController.open({
            type: "success",
            message: `Copied ${text}`
        })
    });

    const customizationController: CustomizationController = useCustomizationController();

    const fieldProps = {
        label: idSetAutomatically ? "ID is set automatically" : "ID",
        disabled: disabled || loading,
        name: "id",
        value: (entity && status === "existing" ? entity.id : entityId) ?? "",
        endAdornment: loading ? <CircularProgress size={"small"}/> : (entity
                ? (
                    <>

                        <Tooltip title={"Copy"}
                                 asChild={true}>
                            <IconButton onClick={(e) => copy(entity.id)}
                                        aria-label="copy-id">
                                <ContentCopyIcon size={"small"}/>
                            </IconButton>
                        </Tooltip>

                        {customizationController?.entityLinkBuilder &&
                            <Tooltip title={"Open in the console"}
                                     asChild={true}>
                                <IconButton component={"a"}
                                            href={customizationController.entityLinkBuilder({ entity })}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                            onClick={(e) => e.stopPropagation()}
                                            aria-label="go-to-datasource">
                                    <OpenInNewIcon size={"small"}/>
                                </IconButton>
                            </Tooltip>}

                    </>
                )
                : undefined
        )
    };

    return (
        <>

            {enumValues &&
                <Select
                    size={"large"}
                    error={error}
                    fullWidth={true}
                    onValueChange={(v) => onChange(v as string)}
                    {...fieldProps}
                    renderValue={(option) => {
                        const enumConfig = enumValues.find(e => e.id === option);
                        if (!enumConfig) return option;
                        return `${enumConfig.id} - ${enumConfig.label}`;
                    }}
                >
                    {enumValues.map((enumConfig) => (
                        <SelectItem
                            key={enumConfig.id}
                            value={String(enumConfig.id)}>
                            <EnumValuesChip
                                enumKey={enumConfig.id}
                                enumValues={enumValues}
                                size={"medium"}/>
                        </SelectItem>)
                    )}
                </Select>}

            {!enumValues &&
                <TextField {...fieldProps}
                           error={error}
                           placeholder={customId === "optional" ? "Autogenerated ID, it can be manually changed" : (status === "new" || status === "copy" ? "ID of the new document" : "ID of the document")}
                           onChange={(event) => {
                               let value = event.target.value;
                               if (value) value = value.trim();
                               return onChange(value.length ? value : undefined);
                           }}/>}

            {errors.id && <Typography variant={"caption"}
                                      className={"ml-3.5 text-red-500 dark:text-red-500"}>
                {errors.id}
            </Typography>}

        </>
    );
}
