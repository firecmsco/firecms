import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CircularProgressCenter, ErrorView, useSnackbarController } from "@firecms/core";
import {
    AddIcon,
    Button,
    CenteredView,
    CircularProgress,
    cn,
    InfoIcon,
    KeyIcon,
    LaunchIcon,
    ListIcon,
    LoadingButton,
    TextareaAutosize,
    Tooltip,
    Typography,
} from "@firecms/ui";
import { ApiError, CloudErrorView, FireCMSBackend, useFireCMSBackend } from "@firecms/cloud";
import { Route, Routes, useNavigate } from "react-router-dom";
import { AdminPermissionsRequiredView } from "../components/project_creation/AdminPermissionsRequiredView";
import { SaaSHelp } from "../components/project_creation/SaaSHelp";
import { GoogleProject } from "../types/google_projects";
import { ExistingProjectsTable } from "../components/ExistingProjectsTable";
import { useSaasAnalytics } from "../components/SaasAnalyticsProvider";
import { NewFireCMSProjectConfigFlow } from "../components/project_creation/NewFireCMSProjectConfigFlow";
import { FireCMSProjectDoctor } from "../components/doctor/FireCMSProjectDoctor";
import { ServiceAccount } from "../types/service_account";
import { verifyServiceAccount } from "../api/gcp_projects";

function NewProjectDoctor({
                              fireCMSBackend,
                              onContinue,
                              projectId,
                              serviceAccount
                          }: {
    projectId: string | undefined,
    onContinue: () => Promise<void>,
    serviceAccount: ServiceAccount | undefined,
    fireCMSBackend: FireCMSBackend
}) {

    const [requirementsFailed, setRequirementsFailed] = useState<boolean>(false);

    return <CenteredView maxWidth={"4xl"} className={"flex flex-col"}>
        <FireCMSProjectDoctor projectId={projectId}
                              onRequirementsPassed={onContinue}
                              onRequirementsFailed={() => {
                                  setRequirementsFailed(true);
                              }}
                              serviceAccount={serviceAccount}
                              fireCMSBackend={fireCMSBackend}/>
        {requirementsFailed && <div className={"flex flex-col gap-4"}>
            <ErrorView
                title={"We could not verify the requirements for this project. "}
                error={"It is possible that the requirements are met but the verification failed. If you are sure the project meets the requirements, you can continue."}>

            </ErrorView>
            <Button onClick={onContinue} variant={"text"}>
                Continue
            </Button>
        </div>}
    </CenteredView>;
}

export function NewFireCMSProjectStart({
                                           fireCMSBackend,
                                           onProjectCreated
                                       }: {
    fireCMSBackend: FireCMSBackend,
    onProjectCreated: (projectId: string) => void
}) {

    const analytics = useSaasAnalytics();

    const { projectsApi } = useFireCMSBackend();

    const [creatingInProgress, setCreatingInProgress] = useState(false);

    const [creationError, setCreationError] = useState<Error | undefined>(undefined);

    const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
    const [serviceAccount, setServiceAccount] = useState<ServiceAccount | undefined>(undefined);

    const snackbarController = useSnackbarController();

    const onPickExistingProject = () => {
        navigate("existing");
    }
    const onServiceAccountInput = () => {
        navigate("sa");
    }

    const onProjectClick = async (project: GoogleProject) => {
        if (project.fireCMSProject) {
            snackbarController.open({
                type: "error",
                message: "This project already has FireCMS enabled. You can ask the owner to add you to the project."
            });
            return;
        }
        setSelectedProjectId(project.projectId);
        navigate("project_doctor");
        analytics.logProjectCreationExistingProjectSelected(project.projectId);
    };

    const onServiceAccountEntered = async (serviceAccount: ServiceAccount) => {
        const projectId = serviceAccount.project_id;
        setSelectedProjectId(projectId);
        setServiceAccount(serviceAccount);
        navigate("project_doctor");
        analytics.logProjectCreationExistingServiceAccountUsed(projectId);
    };

    const createProject = async () => {

        if (!fireCMSBackend.googleCredential?.accessToken && !serviceAccount)
            throw Error("Missing Google credential in onProjectClick");
        if (!selectedProjectId)
            throw Error("Invalid state `project_doctor`");

        setCreationError(undefined);
        setCreatingInProgress(true);

        function onError(e?: any) {

            analytics.logProjectCreationNewProjectError();
            setCreationError(e ?? new Error("Unknown error"));
            snackbarController.open({
                type: "error",
                message: e?.message ?? "Error creating new FireCMS project"
            });
        }

        const accessToken = fireCMSBackend.googleCredential?.accessToken;
        projectsApi.createNewFireCMSProject(selectedProjectId, accessToken, serviceAccount, serviceAccount ? "existing_sa" : "existing")
            .then((success) => {
                if (success) {
                    navigate("project_config");
                } else {
                    onError();
                }
            })
            .catch(e => {
                console.error(e);
                onError(e);
            })
            .finally(() => setCreatingInProgress(false));
        navigate("project_config");
    };

    const navigate = useNavigate();
    const onNewProject = useCallback(() => {
        analytics.logProjectCreationNewProjectSelected();
        navigate("/gcp");
    }, [navigate]);

    if (creatingInProgress) {
        return <CircularProgressCenter/>;
    } else {
        return (
            <Routes>
                <Route path="/"
                       element={
                           <Intro creatingInProgress={creatingInProgress}
                                  fireCMSBackend={fireCMSBackend}
                                  onPickExistingProject={onPickExistingProject}
                                  onServiceAccountInput={onServiceAccountInput}
                                  onNewProjectClick={onNewProject}/>
                       }/>
                <Route path="/existing"
                       element={
                           <SelectExistingProject fireCMSBackend={fireCMSBackend}
                                                  disabled={creatingInProgress}
                                                  onProjectClick={onProjectClick}/>
                       }/>
                <Route path="/sa"
                       element={
                           <ServiceAccountKeyInput fireCMSBackend={fireCMSBackend}
                                                   disabled={creatingInProgress}
                                                   onServiceAccountEntered={onServiceAccountEntered}/>
                       }/>
                <Route path="/project_config"
                       element={<NewFireCMSProjectConfigFlow
                           creationError={creationError}
                           fireCMSBackend={fireCMSBackend}
                           createProject={createProject}
                           serviceAccount={serviceAccount}
                           selectedProjectId={selectedProjectId}
                           onProjectCreated={onProjectCreated}/>
                       }/>
                <Route path="/project_doctor"
                       element={<NewProjectDoctor projectId={selectedProjectId}
                                                  onContinue={createProject}
                                                  serviceAccount={serviceAccount}
                                                  fireCMSBackend={fireCMSBackend}/>
                       }/>
            </Routes>
        );
    }

}

function SelectExistingProject({
                                   disabled,
                                   fireCMSBackend,
                                   onProjectClick
                               }: {
    fireCMSBackend: FireCMSBackend,
    disabled: boolean,
    onProjectClick: (project: GoogleProject) => Promise<void>
}) {

    if (!fireCMSBackend.googleCredential) {
        return <AdminPermissionsRequiredView fireCMSBackend={fireCMSBackend}/>;
    }

    return <CenteredView maxWidth={"5xl"}>
        <ExistingProjectsTable
            fireCMSBackend={fireCMSBackend}
            disabled={disabled}
            onProjectClick={onProjectClick}/>
    </CenteredView>;
}

function ServiceAccountKeyInput({
                                    fireCMSBackend,
                                    disabled,
                                    onServiceAccountEntered
                                }: {
    fireCMSBackend: FireCMSBackend,
    disabled: boolean,
    onServiceAccountEntered: (serviceAccount: ServiceAccount) => void
}) {

    const [saKey, setSaKey] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const [error, setError] = useState<Error | undefined>();

    const {
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
            accept: { "application/json": [] },
            noDragEventsBubbling: true,
            noClick: true,
            maxSize: 512 * 1024,
            onDrop: (files) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    setSaKey(result);
                    return doVerifyServiceAccount(result);
                };
                reader.readAsText(files[0]);
            },
            onDropRejected: (fileRejections, event) => {
                console.log("fileRejections", fileRejections, event)
            },
            disabled,
            maxFiles: 1,
            preventDropOnDocument: false
        }
    );

    const doVerifyServiceAccount = async (input: string) => {
        const serviceAccount = JSON.parse(input);
        setError(undefined);
        setLoading(true);
        if (!serviceAccount.project_id) {
            setError(new Error("Invalid service account key: missing project_id"));
            return;
        }
        if (!serviceAccount.client_email) {
            setError(new Error("Invalid service account key: missing client_email"));
            return;
        }
        if (!serviceAccount.private_key) {
            setError(new Error("Invalid service account key: missing private_key"));
            return;
        }
        const firebaseAccessToken = await fireCMSBackend.getBackendAuthToken();

        return verifyServiceAccount({
            firebaseAccessToken,
            serviceAccount
        })
            .then(res => {
                if (res) {
                    onServiceAccountEntered(serviceAccount);
                } else {
                    setError(new Error("Invalid service account key"));
                }
            })
            .catch((e: ApiError) => {
                setError(e);
            })
            .finally(() => setLoading(false));
    };

    return <CenteredView maxWidth={"2xl"}
                         outerClassName={cn({
                             "border-2 border-dashed": true,
                             "border-transparent": !isDragActive,
                             "border-gray-300 dark:border-gray-700": isDragActive,
                             "transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)] border-red-500": isDragReject,
                             "transition-colors duration-200 ease-[cubic-bezier(0,0,0.2,1)] border-green-500": isDragAccept,
                         })}
                         className={"flex flex-col gap-4 py-8"}
                         {...getRootProps()}>
        <Typography variant={"h6"} className={"flex gap-4"}>
            <KeyIcon/> Enter service account key
        </Typography>
        <Typography>
            You can add the service account key from your Firebase project. This key is used to authenticate your
            FireCMS backend with Firebase.
        </Typography>
        <Typography>
            The service account needs to have the following roles:
        </Typography>
        <ul className={"list-disc list-inside "}>
            <li><b><code>Firebase Admin</code></b></li>
            <li><b><code>Firebase Admin SDK Administrator Service Agent</code></b></li>
            <li><b><code>Firebase Service Management Service Agent</code></b></li>
        </ul>
        <Typography>
            The service account key is a JSON file that you can download from the Firebase console.
        </Typography>
        <TextareaAutosize title={"Service account key"}
                          placeholder={"Paste your service account key here"}
                          minRows={8}
                          maxRows={8}
                          value={saKey}
                          onChange={(e) => setSaKey(e.target.value)}
                          className={"p-2 rounded bg-white dark:bg-gray-950 font-mono text-sm w-full"}/>

        <input
            {...getInputProps()} />

        <div className={"flex flex-row gap-2"}>
            <LoadingButton variant={"outlined"}
                           loading={loading}
                           size={"large"}
                           disabled={disabled || !saKey}
                           onClick={() => doVerifyServiceAccount(saKey)}>
                {error ? "Try again" : "Continue"}
            </LoadingButton>

            <Button variant={"text"}
                    component={"a"}
                    rel="noopener noreferrer"
                    target="_blank"
                    href={"https://firecms.co/docs/creating_service_account"}>
                How to create your service account key <LaunchIcon size={"small"}/>
            </Button>
        </div>

        {error && <CloudErrorView error={error}/>}

    </CenteredView>;
}

function Intro({
                   creatingInProgress,
                   onNewProjectClick,
                   onPickExistingProject,
                   onServiceAccountInput
               }: {
    creatingInProgress: boolean,
    fireCMSBackend: FireCMSBackend,
    onPickExistingProject: () => void,
    onServiceAccountInput: () => void,
    onNewProjectClick: () => void,
}) {
    return <CenteredView maxWidth={"5xl"}>

        <div className={"grid grid-cols-12"}>
            <div className={"col-span-12 md:col-span-6 my-8"}>

                <div className="flex flex-col space-y-2 p-2 h-full justify-center gap-2">

                    <Typography variant={"h4"}>
                        🙌🔥
                    </Typography>
                    <Typography variant={"h4"}>
                        Let&apos;s get started
                    </Typography>

                    <Typography>
                        FireCMS uses Firebase as a backend. You can either
                        select an existing Firebase project or create a new
                        one.
                    </Typography>
                    <Typography>
                        Firebase is a powerful backend-as-a-service
                        platform that provides a wide range of features
                        including authentication, storage, hosting, and
                        more.
                    </Typography>
                    <Typography>
                        <b>You are the owner</b> of the Firebase project and
                        you can manage it from the Firebase console.
                    </Typography>

                    {/*<div className="flex flex-row items-center space-x-1 font-bold px-2">*/}
                    {/*    <FirebaseLogo width={"96px"} height={"96px"} style={{ padding: "10px" }}/>*/}
                    {/*    +*/}
                    {/*    <FireCMSLogo width={"96px"} height={"96px"} style={{ padding: "10px" }}/>*/}
                    {/*    =*/}
                    {/*    <FavoriteIcon*/}
                    {/*        size={96}*/}
                    {/*        style={{*/}
                    {/*            padding: "10px"*/}
                    {/*        }}*/}
                    {/*        className="text-red-500"/>*/}
                    {/*</div>*/}
                    <SaaSHelp/>
                </div>

            </div>

            <div className={"col-span-12 md:col-span-6 my-8 md:ml-8"}>

                <div className="flex flex-col space-y-2 p-2">
                    <div className="flex">
                        <Typography className="flex-grow uppercase font-medium text-sm">
                            Pick one of the following options for creating your project
                        </Typography>
                        {creatingInProgress &&
                            <CircularProgress size="small"/>}
                    </div>

                    <Tooltip
                        title={"For existing projects, we handle all the configuration for you."}>
                        <Typography className="pt-4 font-medium text-sm flex items-center">
                            <InfoIcon className="mr-2" size={"smallest"}/>
                            Pick an existing project using your Google Cloud account
                        </Typography>

                    </Tooltip>

                    <Button variant={"outlined"}
                            size={"large"}
                            className="mb-3"
                            disabled={creatingInProgress}
                            onClick={onPickExistingProject}>
                        <ListIcon className="mr-2"/>
                        Pick existing Firebase project
                    </Button>

                    <Tooltip
                        title={"This is the best option if you need finer grain control over project permissions"}>
                        <Typography className="pt-4 font-medium text-sm flex items-center">
                            <InfoIcon className="mr-2" size={"smallest"}/>
                            Add the service account key from your Firebase project
                        </Typography>
                    </Tooltip>
                    <Button variant={"outlined"}
                            size={"large"}
                            className="mb-3"
                            disabled={creatingInProgress}
                            onClick={onServiceAccountInput}>
                        <KeyIcon className="mr-2"/>
                        Enter service account key
                    </Button>

                    <Tooltip
                        title={"If you don't have a project, we will create for you."}>
                        <Typography className="pt-4 font-medium text-sm flex items-center">
                            <InfoIcon className="mr-2" size={"smallest"}/>
                            Let us create a new Firebase project for you
                        </Typography>
                    </Tooltip>

                    <Button variant={"outlined"}
                            size={"large"}
                            className="mb-3"
                            disabled={creatingInProgress}
                            onClick={onNewProjectClick}>
                        <AddIcon/>
                        Create new Firebase project
                    </Button>

                </div>

            </div>

        </div>
    </CenteredView>;
}
