import React, { useDeferredValue, useEffect, useState } from "react";

import { FireCMSLogo, useBrowserTitleAndIcon, useSnackbarController } from "@firecms/core";
import {
    BooleanSwitch,
    BooleanSwitchWithLabel,
    Button,
    Checkbox,
    Container,
    FileUpload,
    OnFileUploadRejected,
    Paper,
    TextField,
    Typography,
} from "@firecms/ui";
import { useFireCMSBackend, useProjectConfig } from "../../hooks";
import { ProjectSubscriptionPlans } from "../subscriptions";
import { SecurityRulesInstructions } from "../SecurityRulesInstructions";
import { AppCheckSettingsView } from "./AppCheckSettingsView";
import { AutoSetupCollectionsSettings } from "./AutoSetupCollectionsSettings";

export function ProjectSettings() {

    const { backendUid } = useFireCMSBackend();

    const projectConfig = useProjectConfig();

    useBrowserTitleAndIcon("Project settings")

    if (!backendUid) {
        throw new Error("No backendUid in ProjectSettings");
    }

    return (
        <Container maxWidth={"6xl"}
                   className={"w-full flex flex-col gap-16 px-4 py-16"}>

            <ProjectSubscriptionPlans/>

            <div className={"flex flex-col gap-2"}>

                <Typography variant={"h4"} className="mt-4 mb-2">Settings</Typography>

                <ProjectNameTextField/>

                <div className={"col-span-12"}>
                    <BooleanSwitchWithLabel
                        position={"start"}
                        label="Enable local text search"
                        onValueChange={(v) => projectConfig.updateLocalTextSearchEnabled(v)}
                        value={projectConfig.localTextSearchEnabled}
                    />
                </div>

                <ThemeColors/>

            </div>

            <div className={"flex flex-col gap-2"}>
                <SecurityRulesInstructions/>
            </div>

            <AppCheckSettingsView/>

            <AutoSetupCollectionsSettings/>

        </Container>
    );

}

function ProjectNameTextField() {

    const projectConfig = useProjectConfig();
    const [name, setName] = useState(projectConfig.projectName ?? "");
    const deferredName = useDeferredValue(name);
    useEffect(() => {
        if (deferredName) projectConfig.updateProjectName(deferredName);
    }, [deferredName]);

    return <TextField value={name}
                      label={"Project name"}
                      onChange={e => setName(e.target.value)}
                      onBlur={() => {
                          if (name) projectConfig.updateProjectName(name);
                      }}/>;

}

function LogoUploadField() {

    const {
        logo,
        uploadLogo
    } = useProjectConfig();

    const snackbarContext = useSnackbarController();

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
        uploadDescription={"Drag and drop your logo here"}
    >
        {logo && <img
            className={"w-40 h-40 p-4"}
            src={logo}/>}

        {!logo && <FireCMSLogo
            className={"w-40 h-40 p-4"}/>}
    </FileUpload>;

}

function SampleComponents() {
    const [checked, setChecked] = useState<boolean>(true);
    return <div className={"p-4 mt-4 flex flex-col items-center gap-2"}>
        <Typography variant={"label"}>Sample theme components</Typography>
        <div className={"flex flex-row gap-4 items-center justify-center"}>
            <Button> Button </Button>
            <Button variant={"outlined"}> Button </Button>
            <BooleanSwitch value={checked} onValueChange={setChecked}/>
            <Checkbox checked={checked} onCheckedChange={setChecked}/>
            <Checkbox color={"secondary"} checked={checked} onCheckedChange={setChecked}/>
        </div>
    </div>;
}

function ThemeColors() {

    const projectConfig = useProjectConfig();
    return <div className={"flex flex-col gap-2 mt-4 mb-2"}>

        <Typography variant={"h4"} className="mt-4 mb-2">Theme</Typography>
        <div className={"grid grid-cols-12 gap-4"}>

            <div className={"col-span-12 md:col-span-6"}>
                <LogoUploadField/>
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
                            <Typography variant={"subtitle2"}>Primary color</Typography>
                        </div>
                        <div className={"flex flex-row gap-2"}>
                            <input
                                type="color"
                                value={projectConfig.secondaryColor}
                                onChange={e => {
                                    return projectConfig.updateSecondaryColor(e.target.value);
                                }}
                            />
                            <Typography variant={"subtitle2"}>Secondary color</Typography>
                        </div>
                    </div>
                    <SampleComponents/>
                </Paper>
            </div>
        </div>

    </div>

}
