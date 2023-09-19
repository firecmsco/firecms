import React, { useDeferredValue, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import {
    CenteredView,
    cn,
    fieldBackgroundHoverMixin,
    fieldBackgroundMixin,
    FireCMSLogo,
    TextField,
    Typography,
    useAuthController,
    useBrowserTitleAndIcon,
    User,
    useSnackbarController
} from "firecms";
import { useProjectConfig } from "../../hooks/useProjectConfig";
import { FirebaseApp } from "firebase/app";
import { ProjectSubscriptionPlans, SubscriptionPlanWidget } from "../subscriptions";
import { useFireCMSBackend } from "../../hooks/useFireCMSBackend";
import { SecurityRulesInstructions } from "../SecurityRulesInstructions";

export function ProjectSettings({}: {

}) {

    const { backendUid, backendFirebaseApp, getBackendAuthToken } = useFireCMSBackend();

    const [showUpgradeBanner, setShowUpgradeBanner] = useState<boolean>(false);

    useBrowserTitleAndIcon("Project settings")


    if(!backendUid){
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

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
            accept: { "*/image": [] },
            noDragEventsBubbling: true,
            maxSize: 2048 * 1024,
            onDrop: onFilesAdded,
            onDropRejected: (fileRejections, event) => {
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
            }
        }
    );

    return <div
        {...getRootProps()}
        className={cn(
            fieldBackgroundMixin,
            fieldBackgroundHoverMixin,
            "flex gap-2",
            "p-4 box-border relative items-center border-2 border-solid border-transparent h-44 outline-none rounded-md duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:border-primary-solid",
            {
                "hover:bg-field-hover dark:hover:bg-field-hover-dark": !isDragActive,
                "transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)] border-red-500": isDragReject,
                "transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)] border-green-500": isDragAccept,
            })}
    >

        <Typography variant={"caption"} color={"secondary"} className={"absolute top-2 left-3.5"}>
            Logo
        </Typography>

        <input
            {...getInputProps()} />

        {logo && <img
            className={"w-40 h-40 p-4"}
            src={logo}/>}

        {!logo && <FireCMSLogo
            className={"w-40 h-40 p-4"}/>}

        <div
            className="flex-grow h-28 box-border flex flex-col items-center justify-center text-center">
            <Typography align={"center"}
                        variant={"label"}>
                Drag and drop your logo here
            </Typography>
        </div>

    </div>
}
