import { CircularProgressCenter, ErrorView } from "@firecms/core";
import { Button, CenteredView, CircularProgress, Typography } from "@firecms/ui";

import { FireCMSBackend, useBuildProjectConfig, useFireCMSBackend } from "@firecms/cloud";
import { useEffect, useState } from "react";
import { WebappCreationView } from "../WebappCreationView";
import { SecurityRulesConfigView } from "./SecurityRulesConfigView";
import { useNavigate } from "react-router-dom";
import { ServiceAccount } from "../../types/service_account";
import { SaaSHelp } from "./SaaSHelp";

export function NewFireCMSProjectConfigFlow({
                                                fireCMSBackend,
                                                serviceAccount,
                                                creationError,
                                                createProject,
                                                selectedProjectId,
                                                onProjectCreated
                                            }: {
    fireCMSBackend: FireCMSBackend,
    serviceAccount?: ServiceAccount,
    creationError?: Error,
    createProject?: () => void,
    selectedProjectId?: string,
    onProjectCreated: (projectId: string) => void
}) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!selectedProjectId) {
            navigate("/")
        }
    }, [navigate, selectedProjectId]);
    if (!selectedProjectId) {
        return null;
    } else {
        return <NewFireCMSProjectConfigFlowInner
            fireCMSBackend={fireCMSBackend}
            creationError={creationError}
            createProject={createProject}
            serviceAccount={serviceAccount}
            selectedProjectId={selectedProjectId}
            onProjectCreated={onProjectCreated}
        />
    }

}

function NewFireCMSProjectConfigFlowInner({
                                              fireCMSBackend,
                                              serviceAccount,
                                              creationError,
                                              createProject,
                                              selectedProjectId,
                                              onProjectCreated
                                          }: {
    fireCMSBackend: FireCMSBackend,
    serviceAccount?: ServiceAccount,
    creationError?: Error,
    createProject?: () => void,
    selectedProjectId: string,
    onProjectCreated: (projectId: string) => void
}) {

    const {
        backendFirebaseApp,
        projectsApi
    } = useFireCMSBackend();

    const [rulesAccepted, setRulesAccepted] = useState<boolean>(false);
    const [webAppEnabled, setWebappEnabled] = useState<boolean>(false);

    const {
        serviceAccountMissing,
        clientFirebaseMissing
    } = useBuildProjectConfig({
        backendFirebaseApp,
        projectId: selectedProjectId,
    });

    useEffect(() => {
        if (!selectedProjectId)
            return;
        if (rulesAccepted && webAppEnabled) {
            onProjectCreated(selectedProjectId);
        }

        if (clientFirebaseMissing !== undefined && !clientFirebaseMissing) {
            setWebappEnabled(true);
        }

    }, [clientFirebaseMissing, onProjectCreated, rulesAccepted, selectedProjectId, webAppEnabled])

    if (!selectedProjectId) {
        return null;
    }

    if (creationError) {

        const code = "code" in creationError ? creationError.code : undefined;
        const knownError = code && [
            "firecms-project-already-exists"
        ].includes(code as string);

        return <CenteredView maxWidth={"2xl"}>
            <div className="flex flex-col gap-4 p-2 h-full justify-center">
                <Typography variant={"h5"}>
                    Error creating new FireCMS project
                </Typography>

                <ErrorView error={creationError}/>

                {!knownError && <>
                    <Typography variant={"body2"}>
                        A usual error when creating new projects is due to the logged in user lacking permissions.
                    </Typography>
                    <Typography variant={"body2"}>
                        These are all the required ones:
                    </Typography>

                    <Typography variant={"caption"} component={"ul"}>
                        <li><code>cloudresourcemanager.projects.get</code></li>
                        <li><code>cloudresourcemanager.projects.list</code></li>
                        <li><code>cloudresourcemanager.projects.create</code></li>
                        <li><code>serviceusage.services.enable</code></li>
                        <li><code>iam.serviceAccounts.create</code></li>
                        <li><code>iam.serviceAccounts.get</code></li>
                        <li><code>iam.serviceAccounts.keys.create</code></li>
                        <li><code>cloudresourcemanager.projects.setIamPolicy</code></li>
                        <li><code>firebase.projects.update</code></li>
                        <li><code>identitytoolkit.tenants.get</code></li>
                    </Typography>

                    {createProject && <div className={"flex flex-row gap-2"}>
                        <Button variant={"outlined"}
                                size={"large"}
                                className="mb-3"
                                onClick={createProject}>
                            Try again
                        </Button>
                    </div>}

                </>}
                <SaaSHelp/>
            </div>
        </CenteredView>;
    }

    if (clientFirebaseMissing === undefined) {
        return <CircularProgressCenter/>;
    }

    if (!webAppEnabled) {
        return <WebappCreationView projectId={selectedProjectId}
                                   onProjectReady={() => {
                                       setWebappEnabled(true);
                                   }}/>;
    }

    if (!serviceAccountMissing && !rulesAccepted) {
        return <SecurityRulesConfigView
            fireCMSBackend={fireCMSBackend}
            projectId={selectedProjectId}
            serviceAccount={serviceAccount}
            onRulesReady={() => {
                setRulesAccepted(true);
            }}/>;
    }

    return <CenteredView>
        <Typography variant={"h5"}>
            Almost there 🙌
        </Typography>
        <CircularProgress size="small"/>
    </CenteredView>;
}
