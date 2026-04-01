import React, { useDeferredValue, useEffect, useState } from "react";

import { FieldCaption, FireCMSLogo, useBrowserTitleAndIcon, useSnackbarController, useTranslation } from "@firecms/core";
import {
    BooleanSwitch,
    BooleanSwitchWithLabel,
    Button,
    Checkbox,
    Container,
    FileUpload,
    OnFileUploadRejected,
    Paper,
    Select,
    SelectItem,
    TextField,
    Typography,
} from "@firecms/ui";
import { useFireCMSBackend, useProjectConfig } from "../../hooks";
import { ProjectSubscriptionPlans } from "../subscriptions";
import { SecurityRulesInstructions } from "../SecurityRulesInstructions";
import { AppCheckSettingsView } from "./AppCheckSettingsView";

export function ProjectSettings() {

    const { backendUid } = useFireCMSBackend();

    const projectConfig = useProjectConfig();
    const { t } = useTranslation();

    useBrowserTitleAndIcon("Project settings")

    if (!backendUid) {
        throw new Error("No backendUid in ProjectSettings");
    }

    return (
        <Container maxWidth={"6xl"}
            className={"w-full flex flex-col gap-16 px-4 py-16"}>

            <ProjectSubscriptionPlans />

            <div className={"flex flex-col gap-4"}>

                <Typography variant={"h4"} className="mt-4 mb-2">{t("settings_heading")}</Typography>

                <ProjectNameTextField />

                <div className={"col-span-12"}>
                     <Select
                         label={t("settings_default_language")}
                         value={projectConfig.defaultLocale ?? "en"}
                         onValueChange={async (value) => {
                             await projectConfig.updateDefaultLocale(value as string);
                         }}>
                         <SelectItem value="en">English (Default)</SelectItem>
                         <SelectItem value="es">Español</SelectItem>
                     </Select>
                     <FieldCaption>
                         {t("settings_default_language_caption")}
                     </FieldCaption>
                 </div>

                <div className={"col-span-12"}>
                    <BooleanSwitchWithLabel
                        position={"start"}
                        label={t("settings_enable_local_text_search")}
                        onValueChange={(v) => projectConfig.updateLocalTextSearchEnabled(v)}
                        value={projectConfig.localTextSearchEnabled}
                    />

                    <FieldCaption>
                        {t("settings_local_text_search_caption")}
                    </FieldCaption>
                </div>

                {/* TypesenseSettingsView hidden - not ready for use */}

                <div className={"col-span-12"}>
                    <BooleanSwitchWithLabel
                        position={"start"}
                        label={t("settings_doc_history_all_collections")}
                        onValueChange={(v) => projectConfig.updateHistoryDefaultEnabled(v)}
                        value={projectConfig.historyDefaultEnabled ?? false}
                    />

                    <FieldCaption>
                        {t("settings_doc_history_caption")}
                    </FieldCaption>
                </div>

                <ThemeColors />

            </div>

            <div className={"flex flex-col gap-2"}>
                <SecurityRulesInstructions />
            </div>

            <AppCheckSettingsView />

            {/*<AutoSetupCollectionsSettings/>*/}

        </Container>
    );

}

function ProjectNameTextField() {

    const projectConfig = useProjectConfig();
    const { t } = useTranslation();
    const [name, setName] = useState(projectConfig.projectName ?? "");
    const deferredName = useDeferredValue(name);
    useEffect(() => {
        if (deferredName) projectConfig.updateProjectName(deferredName);
    }, [deferredName]);

    return <TextField value={name}
        label={t("settings_project_name")}
        onChange={e => setName(e.target.value)}
        onBlur={() => {
            if (name) projectConfig.updateProjectName(name);
        }} />;

}

function LogoUploadField() {

    const {
        logo,
        uploadLogo
    } = useProjectConfig();

    const snackbarContext = useSnackbarController();
    const { t } = useTranslation();

    const onFilesAdded = async (acceptedFiles: File[]) => {
        if (!acceptedFiles.length)
            return;

        uploadLogo(acceptedFiles[0]);
    }

    const onFilesRejected: OnFileUploadRejected = (fileRejections, event) => {
        for (const fileRejection of fileRejections) {
            for (const error of fileRejection.errors) {
                snackbarContext.open({
                    type: "error",
                    message: `Error uploading file: ${error.message}`
                });
            }
        }
    };

    return <FileUpload
        size={"large"}
        accept={{ "*/image": [] }}
        maxSize={2048 * 1024}
        onFilesAdded={onFilesAdded}
        onFilesRejected={onFilesRejected}
        uploadDescription={t("settings_drag_drop_logo")}
    >
        {logo && <img
            className={"w-40 h-40 p-4"}
            src={logo} />}

        {!logo && <FireCMSLogo
            className={"w-40 h-40 p-4"} />}
    </FileUpload>;

}

function SampleComponents() {
    const [checked, setChecked] = useState<boolean>(true);
    const { t } = useTranslation();
    return <div className={"p-4 mt-4 flex flex-col items-center gap-2"}>
        <Typography variant={"label"}>{t("settings_sample_theme_components")}</Typography>
        <div className={"flex flex-row gap-4 items-center justify-center"}>
            <Button color={"primary"}> Button </Button>
            <Button> Button </Button>
            <BooleanSwitch value={checked} onValueChange={setChecked} />
            <Checkbox checked={checked} onCheckedChange={setChecked} />
            <Checkbox color={"secondary"} checked={checked} onCheckedChange={setChecked} />
        </div>
    </div>;
}

function ThemeColors() {

    const projectConfig = useProjectConfig();
    const { t } = useTranslation();
    return <div className={"flex flex-col gap-2 mt-4 mb-2"}>

        <Typography variant={"h4"} className="mt-4 mb-2">{t("settings_theme")}</Typography>
        <div className={"grid grid-cols-12 gap-4"}>

            <div className={"col-span-12 md:col-span-6"}>
                <LogoUploadField />
            </div>

            <div className={"col-span-12 md:col-span-6"}>
                <Paper className={"flex flex-col gap-2 p-4"}>

                    <div className={"flex flex-row gap-4 justify-center mt-4"}>
                        <div className={"flex flex-row gap-2"}>
                            <input
                                type="color"
                                value={projectConfig.primaryColor}
                                onChange={e => {
                                    return projectConfig.updatePrimaryColor(e.target.value);
                                }}
                            />
                            <Typography variant={"subtitle2"}>{t("settings_primary_color")}</Typography>
                        </div>
                        <div className={"flex flex-row gap-2"}>
                            <input
                                type="color"
                                value={projectConfig.secondaryColor}
                                onChange={e => {
                                    return projectConfig.updateSecondaryColor(e.target.value);
                                }}
                            />
                            <Typography variant={"subtitle2"}>{t("settings_secondary_color")}</Typography>
                        </div>
                    </div>
                    <SampleComponents />
                </Paper>
            </div>
        </div>

    </div>

}
