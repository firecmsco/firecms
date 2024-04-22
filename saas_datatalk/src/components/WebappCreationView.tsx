import { useSnackbarController } from "@firecms/core";
import { CenteredView, CircularProgress, Typography } from "@firecms/ui";

import { CloudErrorView, useFireCMSBackend } from "@firecms/cloud";
import { useCallback, useEffect, useRef, useState } from "react";

export function WebappCreationView({
                                       onProjectReady,
                                       projectId
                                   }: {
    onProjectReady?: () => void;
    projectId: string
}) {

    const fireCMSBackend = useFireCMSBackend();
    const { projectsApi } = fireCMSBackend;

    const [creatingFirebaseWebapp, setCreatingFirebaseWebapp] = useState(false);
    const [creatingFirebaseWebappError, setCreatingFirebaseWebappError] = useState<Error | undefined>();
    const initialRequestSentRef = useRef(false);

    const snackbarController = useSnackbarController();

    const createWebapp = useCallback(async () => {

        setCreatingFirebaseWebapp(true);
        setCreatingFirebaseWebappError(undefined);

        projectsApi.createFirebaseWebapp(projectId)
            .then(() => {
                if (onProjectReady) onProjectReady();
            })
            .catch(e => {
                console.error(e);
                // snackbarController.open({
                //     type: "error",
                //     message: "Error creating new Firebase webapp"
                // });
                setCreatingFirebaseWebappError(e);
            })
            .finally(() => setCreatingFirebaseWebapp(false));
    }, [creatingFirebaseWebapp, onProjectReady, projectId, snackbarController]);

    useEffect(() => {
        if (!initialRequestSentRef.current) {
            initialRequestSentRef.current = true;
            createWebapp();
        }
    }, [createWebapp]);

    return (
        <CenteredView className={"flex flex-col items-center justify-center gap-4"}>

            <Typography variant={"h5"}>
                Creating webapp in your project
            </Typography>

            {!creatingFirebaseWebappError &&
                <CircularProgress size="small"/>}

            {!creatingFirebaseWebapp && creatingFirebaseWebappError &&
                <CloudErrorView error={creatingFirebaseWebappError}
                                fireCMSBackend={fireCMSBackend}
                                onFixed={createWebapp}
                                onRetry={createWebapp}
                />}

        </CenteredView>
    );
}
