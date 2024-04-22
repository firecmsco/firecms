import { AdminPermissionsRequiredView } from "../project_creation/AdminPermissionsRequiredView";
import { FireCMSBackend, useFireCMSBackend, useSnackbarController } from "@firecms/cloud";
import {
    CircularProgress,
    Collapse,
    Dialog,
    IconButton,
    InfoLabel,
    LocalHospitalIcon,
    Paper,
    RefreshIcon,
    Typography
} from "@firecms/ui";

import { GoogleProjectConfigurationStatus } from "../../types/google_projects";
import React, { useCallback, useEffect, useState } from "react";
import {
    enableFirebase,
    enableFirestore,
    enableRequiredApis,
    enableStorage,
    getProjectStatus
} from "../../api/gcp_projects";
import { EnableAuthView } from "../project_creation/EnableAuthView";
import { useGCPDoctorStatus } from "../../hooks/useGCPDoctorStatus";
import { GCPLocationsSelect } from "../GCPLocationsSelect";
import { DoctorCheck } from "./DoctorCheck";
import { useNavigate } from "react-router-dom";
import { ServiceAccount } from "../../types/service_account";

function requirementsFulfilled(requirements: GoogleProjectConfigurationStatus | undefined) {
    return requirements && Object.values(requirements).every(r => r === true);
}

export function FireCMSProjectDoctor({
                                         projectId,
                                         fireCMSBackend,
                                         serviceAccount,
                                         onRequirementsPassed,
                                         onRequirementsFailed
                                     }: {
    projectId?: string,
    fireCMSBackend: FireCMSBackend,
    serviceAccount?: ServiceAccount,
    onRequirementsPassed?: () => void,
    onRequirementsFailed?: () => void
}) {

    const navigate = useNavigate();

    useEffect(() => {
        if (!projectId) {
            navigate("/")
        }
    }, [navigate, projectId]);

    if (!projectId) {
        return null;
    } else {
        return <FireCMSProjectDoctorInner
            fireCMSBackend={fireCMSBackend}
            projectId={projectId}
            serviceAccount={serviceAccount}
            onRequirementsPassed={onRequirementsPassed}
            onRequirementsFailed={onRequirementsFailed}
        />
    }
}

function FireCMSProjectDoctorInner({
                                       projectId,
                                       fireCMSBackend,
                                       serviceAccount,
                                       onRequirementsPassed,
                                       onRequirementsFailed
                                   }: {
    projectId: string,
    fireCMSBackend: FireCMSBackend,
    serviceAccount?: ServiceAccount,
    onRequirementsPassed?: () => void,
    onRequirementsFailed?: () => void
}) {

    const { backendFirebaseApp } = useFireCMSBackend();

    const [requirements, setRequirements] = useState<GoogleProjectConfigurationStatus | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | undefined>(undefined);

    const [authDialogOpen, setAuthDialogOpen] = useState<boolean>(false);
    const [locationId, setLocationId] = useState<string | undefined>(undefined);

    const snackbarController = useSnackbarController();

    const doctorStatus = useGCPDoctorStatus({
        projectId,
        userId: fireCMSBackend.user?.uid,
        firebaseApp: backendFirebaseApp
    });

    useEffect(() => {
        if (doctorStatus?.requirements && !doctorStatus.error) {
            setRequirements(doctorStatus?.requirements);
        }
    }, [doctorStatus]);

    // call onChecksPassed when all requirements are passed
    useEffect(() => {
        if (!requirements) return;
        const allRequirements = requirementsFulfilled(requirements);
        if (onRequirementsPassed && allRequirements && !loading) {
            setTimeout(() => {
                onRequirementsPassed();
            }, 1000);
        }
        if (!allRequirements && onRequirementsFailed && !loading) {
            onRequirementsFailed();
        }
    }, [onRequirementsFailed, onRequirementsPassed, requirements, loading]);

    const loadProject = useCallback(async () => {
        if (!fireCMSBackend.googleCredential?.accessToken && !serviceAccount)
            return;
        setLoading(true);
        const firebaseToken = await fireCMSBackend.getBackendAuthToken();
        getProjectStatus({
            projectId,
            firebaseAccessToken: firebaseToken,
            serviceAccount,
            googleAccessToken: fireCMSBackend.googleCredential?.accessToken
        })
            .then(setRequirements)
            .catch(e => {
                console.error(e);
                setRequirements(null);
                setError(e);
            })
            .finally(() => setLoading(false));
    }, [fireCMSBackend.googleCredential?.accessToken, error, projectId, requirements, serviceAccount]);

    useEffect(() => {
        if (fireCMSBackend.googleCredential?.accessToken || serviceAccount)
            loadProject();
    }, [fireCMSBackend.googleCredential?.accessToken, serviceAccount]);

    if (!fireCMSBackend.googleCredential?.accessToken && !serviceAccount) {
        return <AdminPermissionsRequiredView fireCMSBackend={fireCMSBackend}
                                             projectId={projectId}
        />
    }

    const shouldShowLocation = !loading && (requirements?.firestoreEnabled === false || requirements?.storageEnabled === false);
    const noErrors = !loading && !error && requirements && requirementsFulfilled(requirements);

    return (
        <>

            <div className={"grid grid-cols-12 gap-4 my-12"}>
                <div className={"col-span-12 md:col-span-6"}>
                    <div
                        className="flex flex-col justify-center h-full max-h-full gap-2">
                        <div className="flex flex-row items-center gap-4">

                            <LocalHospitalIcon/>

                            <Typography variant={"h4"}
                                        className="flex-grow">
                                FireCMS Doctor
                            </Typography>

                            <IconButton onClick={loadProject}
                                        disabled={loading}>
                                {!loading && <RefreshIcon/>}
                                {loading &&
                                    <CircularProgress size="small"/>}
                            </IconButton>

                        </div>

                        <InfoLabel mode={noErrors ? "info" : "warn"}>
                            {projectId}
                        </InfoLabel>

                        <Typography className="mb-1">
                            This is a list of requirements that your project
                            must
                            meet in
                            order to use FireCMS.
                        </Typography>

                        <Collapse in={shouldShowLocation}>
                            <div className="py-2">
                                <Typography className="py-2">
                                    Please select the location where you want to
                                    enable
                                    Firestore or Cloud Storage:
                                </Typography>
                                <GCPLocationsSelect value={locationId}
                                                    accessToken={fireCMSBackend.googleCredential?.accessToken}
                                                    serviceAccount={serviceAccount}
                                                    onValueChange={setLocationId}/>
                            </div>
                        </Collapse>
                    </div>

                </div>

                <div className={"col-span-12 md:col-span-6"}>
                    <Paper
                        className="bg-inherit overflow-auto w-full p-4 bg-white dark:bg-gray-900 flex flex-col gap-4">

                        <DoctorCheck
                            loading={loading}
                            title={"Required APIs enabled"}
                            serviceIsEnabled={requirements?.apisEnabled}
                            disabled={false}
                            tooltip={"The following APIs are required:\n" +
                                "firebase.googleapis.com\n" +
                                "firebasestorage.googleapis.com\n" +
                                "firestore.googleapis.com"}
                            enableService={async () => {
                                const firebaseToken = await fireCMSBackend.getBackendAuthToken();
                                if (!requirements) throw Error("Requirements not defined");
                                return enableRequiredApis({
                                    projectId,
                                    serviceAccount,
                                    firebaseAccessToken: firebaseToken,
                                    googleAccessToken: fireCMSBackend.googleCredential?.accessToken
                                })
                                    .then(() => setRequirements({
                                        ...requirements,
                                        apisEnabled: true
                                    }))
                                    .then(() => loadProject())
                                    .catch((e) => {
                                        console.error(e);
                                        snackbarController.open({
                                            type: "error",
                                            message: "Error enabling required APIs: " + e.message
                                        });
                                        throw e;
                                    });
                            }}
                        />

                        <DoctorCheck
                            loading={loading}
                            title={"Firebase enabled"}
                            serviceIsEnabled={requirements?.firebaseEnabled}
                            disabled={!requirements?.firebaseEnabled && !requirements?.apisEnabled}
                            enableService={async () => {
                                const firebaseToken = await fireCMSBackend.getBackendAuthToken();
                                if (!requirements) throw Error("Requirements not defined");
                                return enableFirebase({
                                    projectId,
                                    serviceAccount,
                                    firebaseAccessToken: firebaseToken,
                                    googleAccessToken: fireCMSBackend.googleCredential?.accessToken
                                })
                                    .then(() => setRequirements({
                                        ...requirements,
                                        firebaseEnabled: true
                                    }))
                                    .catch((e) => {
                                        console.error(e);
                                        snackbarController.open({
                                            type: "error",
                                            message: "Error enabling Firebase: " + e.message
                                        });
                                        throw e;
                                    });
                            }}/>

                        <DoctorCheck
                            loading={loading}
                            title={"Firestore enabled"}
                            serviceIsEnabled={requirements?.firestoreEnabled}
                            disabled={!requirements?.firestoreEnabled && !requirements?.apisEnabled}
                            enableService={async () => {
                                const firebaseToken = await fireCMSBackend.getBackendAuthToken();

                                if (!locationId) {
                                    snackbarController.open({
                                        type: "info",
                                        message: "Please select a location"
                                    });
                                    return Promise.resolve();
                                }
                                if (!requirements) throw Error("Requirements not defined");
                                return enableFirestore({
                                    projectId,
                                    locationId,
                                    serviceAccount,
                                    firebaseAccessToken: firebaseToken,
                                    googleAccessToken: fireCMSBackend.googleCredential?.accessToken
                                })
                                    .then(() => setRequirements({
                                        ...requirements,
                                        firestoreEnabled: true
                                    }))
                                    .catch((e) => {
                                        console.error(e);
                                        snackbarController.open({
                                            type: "error",
                                            message: "Error enabling Firestore: " + e.message
                                        });
                                        throw e;
                                    });
                            }}/>

                        <DoctorCheck
                            loading={loading}
                            title={"Cloud Storage enabled"}
                            serviceIsEnabled={requirements?.storageEnabled}
                            disabled={!requirements?.storageEnabled && !requirements?.apisEnabled}
                            enableService={async () => {
                                const firebaseToken = await fireCMSBackend.getBackendAuthToken();
                                if (!locationId) {
                                    snackbarController.open({
                                        type: "info",
                                        message: "Please select a location"
                                    });
                                    return Promise.resolve();
                                }
                                if (!requirements) throw Error("Requirements not defined");
                                return enableStorage({
                                    projectId,
                                    locationId,
                                    serviceAccount,
                                    firebaseAccessToken: firebaseToken,
                                    googleAccessToken: fireCMSBackend.googleCredential?.accessToken
                                })
                                    .then(() => setRequirements(({
                                        ...requirements,
                                        storageEnabled: true
                                    })))
                                    .catch((e) => {
                                        console.error(e);
                                        snackbarController.open({
                                            type: "error",
                                            message: "Error enabling Cloud Storage: " + e.message
                                        });
                                        throw e;
                                    });
                            }}/>

                        <DoctorCheck
                            loading={loading}
                            title={"Auth enabled"}
                            serviceIsEnabled={requirements?.authEnabled}
                            disabled={!requirements?.authEnabled && !requirements?.apisEnabled}
                            enableService={() => {
                                setAuthDialogOpen(true);
                                return Promise.resolve();
                            }}/>

                    </Paper>
                </div>

            </div>

            {requirements && <Dialog open={authDialogOpen}
                                     maxWidth={"5xl"}
                                     className={"p-4"}
                                     onOpenChange={setAuthDialogOpen}>
                <EnableAuthView
                    fireCMSBackend={fireCMSBackend}
                    projectId={projectId}
                    serviceAccount={serviceAccount}
                    onAuthEnabled={() => {
                        setAuthDialogOpen(false);
                        setRequirements({
                            ...requirements,
                            authEnabled: true
                        });
                    }}/>
            </Dialog>}

        </>
    );

}
