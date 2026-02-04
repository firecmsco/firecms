import React, { useEffect, useState } from "react";
import { FieldCaption, useNavigationController, useSnackbarController } from "@firecms/core";
import {
    BooleanSwitchWithLabel,
    Button,
    MultiSelect,
    MultiSelectItem,
    Paper,
    TextField,
    Typography
} from "@firecms/ui";
import { useProjectConfig } from "../../hooks";
import { TypesenseSearchConfig } from "../../hooks/useBuildProjectConfig";

export function TypesenseSettingsView() {
    const projectConfig = useProjectConfig();
    const navigationController = useNavigationController();
    const snackbarController = useSnackbarController();

    const [config, setConfig] = useState<TypesenseSearchConfig>(projectConfig.typesenseSearchConfig ?? {
        enabled: false,
        region: "us-central1",
        extensionInstanceId: "typesense-search",
        collections: []
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (projectConfig.typesenseSearchConfig) {
            setConfig(projectConfig.typesenseSearchConfig);
        }
    }, [projectConfig.typesenseSearchConfig]);

    const handleChange = (key: keyof TypesenseSearchConfig, value: any) => {
        setConfig({
            ...config,
            [key]: value
        });
    };

    const handleEnableChange = (enabled: boolean) => {
        const newConfig = {
            ...config,
            enabled
        };
        setConfig(newConfig); // Update local UI state
        // Persist enabled state immediately
        projectConfig.updateTypesenseSearchConfig(newConfig).catch((e: any) => {
            console.error(e);
            snackbarController.open({
                type: "error",
                message: "Error updating Typesense status: " + e.message
            });
        });
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await projectConfig.updateTypesenseSearchConfig(config);
            snackbarController.open({
                type: "success",
                message: "Typesense configuration saved"
            });
        } catch (e: any) {
            console.error(e);
            snackbarController.open({
                type: "error",
                message: "Error saving Typesense configuration: " + e.message
            });
        } finally {
            setLoading(false);
        }
    };

    const collections = navigationController.collections ?? [];

    const saveDisabled = config.enabled && !config.region;

    return (
        <div className={"col-span-12"}>
            <BooleanSwitchWithLabel
                position={"start"}
                label="Enable Typesense search"
                value={config.enabled}
                onValueChange={handleEnableChange}
            />
            <FieldCaption>
                Enable Typesense search integration. You need to have the FireCMS Typesense extension installed in your
                Firebase project.
            </FieldCaption>

            {config.enabled && (
                <Paper className={"flex flex-col gap-4 p-4 mt-4"}>
                    <Typography variant={"subtitle2"}>
                        Typesense Configuration
                    </Typography>
                    <TextField
                        required
                        label="GCP Region"
                        value={config.region}
                        onChange={(e) => handleChange("region", e.target.value)}
                        placeholder={"europe-west3"}
                        size={"small"}
                        error={!config.region}
                    />
                    {!config.region && (
                        <FieldCaption error={true}>
                            Region is required
                        </FieldCaption>
                    )}

                    <TextField
                        label="Extension Instance ID"
                        value={config.extensionInstanceId}
                        onChange={(e) => handleChange("extensionInstanceId", e.target.value)}
                        placeholder={"typesense-search"}
                        size={"small"}
                    />
                    <FieldCaption>
                        The region where your Typesense instance is located (e.g. europe-west3).
                        And the instance ID of the installed extension (default: typesense-search).
                    </FieldCaption>

                    <div className="flex flex-col gap-2">
                        <Typography variant={"subtitle2"}>Indexed Collections</Typography>
                        <MultiSelect
                            value={config.collections ?? []}
                            onValueChange={(v) => handleChange("collections", v)}
                            label="Select collections to index"
                            placeholder={"All collections (Default)"}
                            size={"small"}
                        >
                            {collections.map(col => (
                                <MultiSelectItem key={col.path} value={col.path}>
                                    {col.name} ({col.path})
                                </MultiSelectItem>
                            ))}
                        </MultiSelect>
                        <FieldCaption>
                            Select the collections that you want to be searchable. If you leave this empty, <b>all
                                collections</b> will be searchable by default.
                        </FieldCaption>
                    </div>

                    <div className={"flex justify-end"}>
                        <Button
                            variant={"filled"}
                            color={"primary"}
                            onClick={handleSave}
                            disabled={saveDisabled || loading}
                        >
                            Save
                        </Button>
                    </div>

                </Paper>
            )}
        </div>
    );
}
