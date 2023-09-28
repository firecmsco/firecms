import React, { useDeferredValue, useEffect, useState } from "react";

import {
    CenteredView,
    FileUpload,
    FireCMSLogo,
    OnFileUploadRejected,
    TextField,
    Typography,
    useBrowserTitleAndIcon,
    useSnackbarController
} from "firecms";
import { useFireCMSBackend, useProjectConfig } from "../../hooks";
import { ProjectSubscriptionPlans, SubscriptionPlanWidget } from "../subscriptions";
import { SecurityRulesInstructions } from "../SecurityRulesInstructions";

export function ProjectSettings() {

    const { backendUid } = useFireCMSBackend();

    const [showUpgradeBanner, setShowUpgradeBanner] = useState<boolean>(false);

    useBrowserTitleAndIcon("Project settings")

    if (!backendUid) {
        throw new Error("No backendUid in ProjectSettings");
    }

    return (
        <CenteredView maxWidth={"6xl"}
                      className={"w-full flex flex-col gap-16 px-4 py-32"}
        >

            <ProjectSubscriptionPlans uid={backendUid}/>

            <div className={"flex flex-col gap-2"}>

                {showUpgradeBanner &&
                    <SubscriptionPlanWidget
                        showForPlans={["free"]}
                        message={<>Upgrade to PLUS to customise the logo</>}/>}

                <Typography variant={"h4"} className="mt-4 mb-2">Settings</Typography>

                <ProjectNameTextField/>

                <LogoUploadField onNoSubscriptionPlan={() => setShowUpgradeBanner(true)}/>
            </div>

            <div className={"flex flex-col gap-2"}>
                <SecurityRulesInstructions/>
            </div>

        </CenteredView>
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

function LogoUploadField({ onNoSubscriptionPlan }: {
    onNoSubscriptionPlan: () => void
}) {

    const {
        logo,
        canUploadLogo,
        uploadLogo
    } = useProjectConfig();

    const snackbarContext = useSnackbarController();

    const onFilesAdded = async (acceptedFiles: File[]) => {
        if (!canUploadLogo) {
            onNoSubscriptionPlan();
            return;
        }
        if (!acceptedFiles.length)
            return;

        uploadLogo(acceptedFiles[0]);
    }

    const onFilesRejected:OnFileUploadRejected = (fileRejections, event) => {
        if (!canUploadLogo) {
            onNoSubscriptionPlan();
        } else {
            for (const fileRejection of fileRejections) {
                for (const error of fileRejection.errors) {
                    snackbarContext.open({
                        type: "error",
                        message: `Error uploading file: ${error.message}`
                    });
                }
            }
        }
    };

    return <FileUpload
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
