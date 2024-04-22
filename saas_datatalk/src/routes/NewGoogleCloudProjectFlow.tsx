import { ErrorView, toKebabCase, useModeController, useSnackbarController } from "@firecms/core";
import { Button, CenteredView, CircularProgress, LoadingButton, Paper, TextField, Typography, } from "@firecms/ui";
import { Field, FormexController, getIn, useCreateFormex } from "@firecms/formex";

import { ApiError, CloudErrorView, FieldCaption, FireCMSBackend, useFireCMSBackend } from "@firecms/cloud";

import * as Yup from "yup";
import React, { useCallback, useEffect } from "react";
import { createNewGCPProject } from "../api/gcp_projects";
import { GCPProjectCreation, GCPProjectCreationStatus, useGCPProjectStatus } from "../hooks/useGCPProjectStatus";
import { NewFireCMSProjectConfigFlow } from "../components/project_creation/NewFireCMSProjectConfigFlow";
import { AdminPermissionsRequiredView } from "../components/project_creation/AdminPermissionsRequiredView";
import { EnableAuthView } from "../components/project_creation/EnableAuthView";
import { GoogleCloudLogo } from "../components/utils/logos/GoogleCloudLogo";
import { getRandomLoadingMessages } from "../utils/loading_messages";
import { SaaSHelp } from "../components/project_creation/SaaSHelp";
import { GCPLocationsSelect } from "../components/GCPLocationsSelect";

type GCPFormValues = {
    projectId: string;
    name: string;
    locationId: string;
}

export const YupSchema = Yup.object().shape({
    projectId: Yup.string().matches(
        /^[a-z](?:[a-z0-9]|-(?=[a-z0-9])){5,29}[a-z0-9]$/,
        "Project ID must be between 6 and 30 characters, start with a letter, and contain only lowercase ASCII letters, digits, or hyphens."
    ).required("Required"),
    locationId: Yup.string().required("Required"),
    name: Yup.string().matches(
        /^(?:\w|-|'|"| |!){4,30}$/,
        "It must be between 4 to 30 characters. Allowed characters are: lowercase and uppercase letters, numbers, hyphen, single-quote, double-quote, space, and exclamation point."
    ).required("Required")
});

const simCityLoadingMessages = getRandomLoadingMessages();

function getStatusMessage(status: GCPProjectCreationStatus): React.ReactNode {
    switch (status) {
        case "creating_gcp_project":
            return "Creating GCP project";
        case "activating_firebase_for_gcp_project":
            return "Activating Firebase for GCP project";
        case "enabling_firestore_api_in_gcp_project":
            return "Enabling Firestore API in GCP project";
        case "creating_default_firestore_database_in_firebase":
            return "Creating default Firestore database in Firebase";
        case "activating_storage_in_firebase":
            return "Activating Storage in Firebase";
        default:
            return status;
    }
}

function GCPLoading({
                        projectStatus
                    }:
                        {
                            projectStatus: GCPProjectCreation,
                        }) {

    const [messageIndex, setMessageIndex] = React.useState(0);

    useEffect(() => {
        const timerID = setInterval(() => setMessageIndex(i => i + 1), 3000)
        return () => {
            clearInterval(timerID)
        }
    }, []);

    return (
        <CenteredView className={"flex flex-col gap-4 items-center"}>

            <Typography variant={"h5"}>
                {simCityLoadingMessages[messageIndex % simCityLoadingMessages.length]}
            </Typography>
            <Typography variant={"caption"}>
                aka: <strong>{getStatusMessage(projectStatus.status)}</strong>
            </Typography>
            <CircularProgress/>

        </CenteredView>
    );
}

function GCPLoadingError({
                             projectStatus,
                             tryAgain
                         }:
                             {
                                 projectStatus: GCPProjectCreation,
                                 tryAgain?: () => void
                             }) {

    const needsToAcceptTerms = projectStatus?.error === "user-has-to-accept-googles-terms-of-service";

    return (
        <CenteredView className={"flex flex-col gap-4 items-center"}>

            {projectStatus.error && !needsToAcceptTerms && <ErrorView
                title={"Error creating Firebase project"}
                error={projectStatus.error}/>}

            {needsToAcceptTerms && <>
                <Typography variant={"h6"}>
                    You need to sign up to <a
                    rel="noopener noreferrer"
                    target="_blank"
                    href={"https://console.cloud.google.com/freetrial/signup"}>Google Cloud
                    Platform</a> before you can use this service.
                </Typography>
                <Typography variant={"caption"}>
                    Once you have signed up, please try again.
                </Typography>
                <Button onClick={tryAgain}>Try again</Button>

            </>}

        </CenteredView>
    );
}

export function NewGoogleCloudProjectFlow({
                                              fireCMSBackend,
                                              onProjectCreated
                                          }: {
    fireCMSBackend: FireCMSBackend,
    onProjectCreated: (projectId: string) => void
}) {

    if (!fireCMSBackend.googleCredential) {
        return <AdminPermissionsRequiredView fireCMSBackend={fireCMSBackend}/>
    }

    return <NewGoogleCloudProjectFlowInternal
        fireCMSBackend={fireCMSBackend}
        onProjectCreated={onProjectCreated}/>;
}

export function NewGoogleCloudProjectFlowInternal({
                                                      fireCMSBackend,
                                                      onProjectCreated
                                                  }: {
    fireCMSBackend: FireCMSBackend,
    onProjectCreated: (projectId: string) => void
}) {

    const {
        backendFirebaseApp,
        projectsApi
    } = useFireCMSBackend();

    const snackbarController = useSnackbarController();
    const modeState = useModeController();

    const [projectId, setProjectId] = React.useState<string | undefined>();
    const [authEnabled, setAuthEnabled] = React.useState(false);
    const [firebaseReady, setFirebaseReady] = React.useState<boolean | "loading">(false);

    const [cmsProjectCreated, setCmsProjectCreated] = React.useState(false);
    const [cmsProjectCreationInProgress, setCmsProjectCreationInProgress] = React.useState<boolean>(false);
    const [cmsProjectCreationError, setCmsProjectCreationError] = React.useState<ApiError | undefined>();

    const accessToken = fireCMSBackend.googleCredential?.accessToken;
    if (!accessToken) {
        throw new Error("NewGoogleCloudProjectFlowInternal: Access token not found");
    }

    const { projectStatus } = useGCPProjectStatus({
        projectId,
        firebaseApp: backendFirebaseApp
    });

    const createFireCMSProject = useCallback(async (projectId: string) => {
        const onError = (message?: string) => {
            snackbarController.open({
                type: "error",
                message: message ?? "Error creating new FireCMS project"
            });
        };
        setCmsProjectCreationInProgress(true);
        setCmsProjectCreationError(undefined);
        return projectsApi.createNewFireCMSProject(projectId, accessToken, undefined, "new")
            .then(() => setCmsProjectCreated(true))
            .catch(e => {
                console.error(e);
                setCmsProjectCreationError(e);
                onError(e.message);
            })
            .finally(() => setCmsProjectCreationInProgress(false));
    }, [accessToken, fireCMSBackend, snackbarController]);

    useEffect(() => {
        if (projectStatus?.done && authEnabled && projectId && !cmsProjectCreationInProgress && !cmsProjectCreated && !cmsProjectCreationError) {
            createFireCMSProject(projectId);
        }
    }, [authEnabled, cmsProjectCreationInProgress, createFireCMSProject, projectId, projectStatus?.done, cmsProjectCreated, cmsProjectCreationError]);

    useEffect(() => {
        if (projectStatus?.status) {
            if (projectStatus.status === "activating_firebase_for_gcp_project") {
                setFirebaseReady("loading");
            } else if (firebaseReady === "loading") {
                setFirebaseReady(true);
            }

        }
    }, [firebaseReady, projectStatus?.status]);

    const [error, setError] = React.useState<ApiError | undefined>(undefined);

    const formex = useCreateFormex({
        initialValues: {
            projectId: "",
            name: "",
            locationId: ""
        },
        validation: (values: GCPFormValues) => {
            return YupSchema.validate(values, { abortEarly: false })
                .then(() => {
                    return {};
                })
                .catch((e: any) => {
                    return e.inner.reduce((acc: any, error: any) => {
                        acc[error.path] = error.message;
                        return acc;
                    }, {});
                });
        },
        onSubmit: async (values: GCPFormValues, formikHelpers: FormexController<GCPFormValues>) => {
            const firebaseToken = await fireCMSBackend.getBackendAuthToken();
            await createNewGCPProject({
                projectId: values.projectId,
                name: values.name,
                locationId: values.locationId,
                firebaseAccessToken: firebaseToken,
                googleAccessToken: accessToken,
            })
                .then(() => {
                    setProjectId(values.projectId);
                })
                .catch((e) => {
                    setError(e);
                });
            formikHelpers.setSubmitting(false);
        }
    });

    const existingProjectIdError = error?.code === "already-exists";

    const {
        values,
        errors,
        isSubmitting,
        touched,
        handleSubmit,
        handleChange,
        submitCount,
        setFieldValue
    } = formex;

    useEffect(() => {
        const projectIdTouched = getIn(touched, "projectId");
        if (!projectIdTouched && values.name) {
            setFieldValue("projectId", toKebabCase(values.name) + "-" + randomString());
        }
    }, [touched, values.name]);

    if (cmsProjectCreated) {
        if (!projectId)
            throw new Error("NewGoogleCloudProjectFlowInternal: Project ID not found");

        return <NewFireCMSProjectConfigFlow
            fireCMSBackend={fireCMSBackend}
            selectedProjectId={projectId}
            creationError={cmsProjectCreationError}
            onProjectCreated={onProjectCreated}/>;
    }

    if (firebaseReady === true && projectId && !authEnabled) {
        return <EnableAuthView projectId={projectId}
                               fireCMSBackend={fireCMSBackend}
                               onAuthEnabled={() => setAuthEnabled(true)}/>;
    }

    if (projectStatus && projectId && !projectStatus.error) {
        return <GCPLoading projectStatus={projectStatus}/>;
    } else if (projectStatus && projectStatus.error) {
        return <GCPLoadingError projectStatus={projectStatus}
                                tryAgain={() => {
                                    if (projectId)
                                        createFireCMSProject(projectId);
                                }}/>;
    }

    const showErrors = submitCount > 0;
    return (
        <CenteredView maxWidth={"5xl"}>

            <div className={"grid grid-cols-12 py-8"}>
                <div className={"col-span-12 md:col-span-6"}>

                    <div className="flex flex-col space-y-2 p-2 h-full justify-center">

                        <Typography variant={"h4"}>
                            Create your backend
                        </Typography>

                        <Typography>
                            In this step we will create a new Firebase project
                            for you. You will be added as an owner of the
                            project.
                        </Typography>

                        <Typography>
                            You will be able to access the new Firebase project
                            and use it as a backend for your app.
                        </Typography>

                        <div className="flex flex-row items-center p-2">
                            <GoogleCloudLogo width={"240px"}
                                             mode={modeState.mode}/>
                        </div>

                        <SaaSHelp/>
                    </div>

                </div>

                <div className={"col-span-12 md:col-span-6"}>
                    <form noValidate
                          onSubmit={handleSubmit}
                    >

                        <div className="flex flex-col gap-4 md:p-4 mt-8 md:mt-0">

                            <Paper className="flex flex-col gap-4 p-4">

                                <div>
                                    <TextField name={"name"}
                                               label={"Name"}
                                               value={values.name}
                                               onChange={handleChange}
                                               required
                                               disabled={isSubmitting}
                                               error={showErrors && Boolean(errors.name)}/>

                                    <FieldCaption error={Boolean(showErrors && Boolean(errors.name))}>
                                        {showErrors && Boolean(errors.name)
                                            ? errors.name
                                            : "This is the project name"}
                                    </FieldCaption>
                                </div>

                                <div>
                                    <TextField name={"projectId"}
                                               value={values.projectId}
                                               onChange={handleChange}
                                               label={"Project ID"}
                                               required
                                               disabled={isSubmitting}
                                               error={(showErrors && Boolean(errors.projectId)) || existingProjectIdError}/>

                                    <FieldCaption
                                        error={(showErrors && Boolean(errors.projectId)) || existingProjectIdError}>
                                        {existingProjectIdError
                                            ? "This project ID has already been used. Please pick a different one"
                                            : (showErrors && Boolean(errors.projectId)
                                                ? errors.projectId
                                                : "This is the project id that will be assigned in Google Cloud Platform")}
                                    </FieldCaption>
                                </div>

                                <div>
                                    <Field name={"locationId"}
                                           onValueChange={(locationId: string) => setFieldValue("locationId", locationId)}
                                           value={values.locationId}
                                           disabled={isSubmitting}
                                           accessToken={accessToken}
                                           as={GCPLocationsSelect}/>
                                </div>

                            </Paper>

                            <LoadingButton
                                variant={"filled"}
                                disabled={isSubmitting || cmsProjectCreationInProgress}
                                type={"submit"}
                                size={"large"}
                                loading={isSubmitting}
                            >
                                Create new Firebase project
                            </LoadingButton>

                            {error && !existingProjectIdError &&
                                <ErrorView error={error}/>}

                        </div>
                    </form>

                    {cmsProjectCreationError && projectId && <CloudErrorView
                        error={cmsProjectCreationError}
                        fireCMSBackend={fireCMSBackend}
                        onRetry={() => createFireCMSProject(projectId)}/>}

                </div>

            </div>
        </CenteredView>
    );
}

export function randomString(strLength = 5) {
    return Math.random().toString(36).slice(2, 2 + strLength);
}
