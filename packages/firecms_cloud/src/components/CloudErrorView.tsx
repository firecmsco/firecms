import { useEffect, useState } from "react";
import { useSnackbarController } from "@firecms/core";
import { BuildIcon, Button, LoadingButton, Typography } from "@firecms/ui";
import { FireCMSBackend } from "../types";
import { useFireCMSBackend } from "../hooks";

export type CloudError = {
    code?: string,
    message: string,
    projectId?: string,
    data?: {
        missingPermissions?: string[],
        errorDetails?: object
    }
};

export function CloudErrorView({
                                   error,
                                   fireCMSBackend,
                                   onFixed,
                                   onRetry
                               }: {
    error: CloudError,
    fireCMSBackend?: FireCMSBackend,
    onFixed?: () => void,
    onRetry?: () => void,
}) {
    const {
        code,
        message,
        projectId
    } = error;

    if (code === "service-account-missing" && projectId && fireCMSBackend) {
        return <CloudMissingServiceAccountErrorView projectId={projectId}
                                                    fireCMSBackend={fireCMSBackend}
                                                    onFixed={onFixed}/>;
    } else if (code === "user-has-to-accept-googles-terms-of-service" && projectId) {
        return <CloudNeedsToAcceptTermsErrorView projectId={projectId}
                                                 onFixed={onFixed}/>;
    } else if (code === "user-has-no-previous-firebase-projects" && projectId) {
        return <CloudNoPreviousFirebaseProjectsErrorView projectId={projectId}
                                                         onFixed={onFixed}/>;
    } else if (code === "firecms-user-not-found") {
        return <div className="flex flex-col space-y-2 py-4">
            <Typography>
                The user trying to log in is not registered in the client project.
            </Typography>
            <Typography>
                Make sure the user exists in the client project and try again.
                If the problem persists, reach us at <a href="mailto:hello@firecms.co?subject=FireCMS%20login%20error"
                                                        rel="noopener noreferrer"
                                                        target="_blank">
                hello@firecms.co </a>, or in our <a
                rel="noopener noreferrer"
                target="_blank"
                href={"https://discord.gg/fxy7xsQm3m"}>Discord channel</a>.
            </Typography>
        </div>;
    } else if (code === "service-account-missing-permissions") {
        return <ServiceAccountMissingPermissions missingPermissions={error.data?.missingPermissions}/>;
    }

    return (<div className="flex flex-col space-y-2 py-4">
            <Typography className="text-red-300">
                {message}
            </Typography>

            {error.data && <pre className="text-xs text-gray-500 p-4">
                {JSON.stringify(error.data, null, 2)}
            </pre>}

            {onRetry && <Button
                variant="outlined"
                color="error"
                onClick={() => onRetry()}
            >
                Retry
            </Button>}
        </div>
    );
}

function CloudMissingServiceAccountErrorView({
                                                 fireCMSBackend,
                                                 projectId,
                                                 onFixed
                                             }: {
    fireCMSBackend: FireCMSBackend,
    projectId: string,
    onFixed?: () => void,
}) {

    const { projectsApi } = useFireCMSBackend();

    const snackbarController = useSnackbarController();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingLogin, setPendingLogin] = useState(false);

    const doCreateServiceAccount = async () => {
        if (!fireCMSBackend.googleCredential?.accessToken) {
            throw new Error("SassMissingServiceAccountErrorView: No access token found");
        }
        setIsSubmitting(true);
        return projectsApi.createServiceAccount(fireCMSBackend.googleCredential.accessToken, projectId)
            .finally(() => setIsSubmitting(false))
    };

    useEffect(() => {
        if (pendingLogin && fireCMSBackend.googleCredential?.accessToken) {
            doCreateServiceAccount().then(() => {
                snackbarController.open({
                    type: "success",
                    message: "Service account created successfully"
                });
                if (onFixed)
                    onFixed();
            }).catch(e => {
                snackbarController.open({
                    type: "error",
                    message: "Service account creation error: " + e.message
                });
            });
            setPendingLogin(false);
        }
    }, [pendingLogin, fireCMSBackend.googleCredential?.accessToken]);

    const onClick = async () => {
        const accessToken = fireCMSBackend.googleCredential?.accessToken;
        if (!accessToken) {
            setPendingLogin(true);
            fireCMSBackend.googleLogin(true);
        } else {
            await doCreateServiceAccount();
        }
    };
    return <div
        className="flex flex-col space-y-2 py-4">
        <Typography color={"error"}>
            Service account missing
        </Typography>
        <LoadingButton
            variant="outlined"
            color="error"
            onClick={onClick}
            loading={isSubmitting}
            startIcon={<BuildIcon/>}
        >
            Fix
        </LoadingButton>
    </div>
}

function CloudNeedsToAcceptTermsErrorView({
                                              projectId,
                                              onFixed
                                          }: {
    projectId: string,
    onFixed?: () => void,
}) {

    return <div
        className="flex flex-col space-y-2 py-4">
        <Typography color={"error"}>
            You need to accept Google&apos;s terms of service
            before you can use this service.
        </Typography>

        <Typography color={"error"}>
            You can do so by visiting the following link:
            <a
                rel="noopener noreferrer"
                target="_blank"
                href={"https://console.cloud.google.com/welcome?project=" + projectId}>
                {`https://console.cloud.google.com/welcome?project=${projectId}`}
            </a>
        </Typography>
        <Button
            variant="outlined"
            color="error"
            onClick={onFixed}
            startIcon={<BuildIcon/>}
        >
            I have accepted the terms
        </Button>
    </div>
}

function CloudNoPreviousFirebaseProjectsErrorView({
                                                      projectId,
                                                      onFixed
                                                  }: {
    projectId: string,
    onFixed?: () => void,
}) {

    return <div
        className="flex flex-col space-y-2 py-4">
        <Typography color={"error"}>
            You need to accept Firebase&apos;s terms of service
            before you can use this service.
        </Typography>

        <Typography color={"error"}>
            You can do so by visiting the following link:
            <a
                rel="noopener noreferrer"
                target="_blank"
                href={"https://console.firebase.google.com/"}>
                {"https://console.firebase.google.com/"}
            </a>
        </Typography>

        <Button
            variant="outlined"
            color="error"
            onClick={onFixed}
            startIcon={<BuildIcon/>}
        >
            I have accepted the terms
        </Button>
    </div>
}

function ServiceAccountMissingPermissions(props: {
    missingPermissions: string[] | undefined,
}) {

    return <div
        className="flex flex-col space-y-2 py-4">

        <Typography color={"error"}>
            Missing permissions
        </Typography>

        {props.missingPermissions && <>
            <Typography variant={"body2"}>
                This service account is missing the following permissions:
            </Typography>

            <Typography variant={"caption"} component={"ul"}>
                {props.missingPermissions.map((permission) => <li key={permission}>
                    <code>{permission}</code>
                </li>)}
            </Typography>
        </>}

    </div>;
}
