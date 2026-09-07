import { useCallback, useEffect, useState } from "react";
import { useSnackbarController } from "@firecms/core";
import { BuildIcon, Button, LoadingButton, OpenInNewIcon, Typography } from "@firecms/ui";
import { ApiError, FireCMSBackend } from "../types";
import { useFireCMSBackend } from "../hooks";
import { useNavigate } from "react-router-dom";

export type CloudError = {
    code?: string,
    message: string,
    projectId?: string,
    data?: {
        missingPermissions?: string[],
        errorDetails?: object,
        /** Why the delegated service account was rejected, when we could tell. */
        reason?: string,
        /** The service account the backend tried to use. */
        clientEmail?: string
    }
};

export function CloudErrorView({
                                   error,
                                   fireCMSBackend,
                                   onFixed,
                                   onRetry,
                                   allowServiceAccountBypass = false
                                }: {
    error: CloudError,
    fireCMSBackend?: FireCMSBackend,
    onFixed?: () => void,
    onRetry?: () => void,
    allowServiceAccountBypass?: boolean;
}) {
    const navigate = useNavigate();
    const {
        code,
        message,
        projectId
    } = error;

    if (code === "service-account-missing" && projectId && fireCMSBackend) {
        return <ServiceAccountRecoveryView projectId={projectId}
                                           fireCMSBackend={fireCMSBackend}
                                           reason={"service-account-absent"}
                                           onFixed={onFixed}/>;
    } else if (code === "service-account-corrupt" && projectId && fireCMSBackend) {
        return <ServiceAccountRecoveryView projectId={projectId}
                                           fireCMSBackend={fireCMSBackend}
                                           reason={error.data?.reason}
                                           clientEmail={error.data?.clientEmail}
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
                If the problem persists, reach us at <a className="text-primary dark:text-primary-light underline" href="mailto:hello@firecms.co?subject=FireCMS%20login%20error"
                                                        rel="noopener noreferrer"
                                                        target="_blank">
                hello@firecms.co </a>, or in our <a
                className="text-primary dark:text-primary-light underline"
                rel="noopener noreferrer"
                target="_blank"
                href={"https://discord.gg/fxy7xsQm3m"}>Discord channel</a>.
            </Typography>
        </div>;
    } else if ((code === "service-account-missing-permissions" || code === "user-missing-permissions") && allowServiceAccountBypass) {
        return (
            <div className="flex flex-col space-y-4 p-6 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900">
                <Typography variant="h6" className="text-red-600 dark:text-red-400">
                    Missing Permissions
                </Typography>
                {error.data?.missingPermissions && <>
                    <Typography variant={"body2"} color={"secondary"}>
                        Your Google Cloud account is missing the following permissions on this project:
                    </Typography>
                    <Typography variant={"caption"} component={"ul"}>
                        {error.data.missingPermissions.map((permission) => <li key={permission}>
                            <code>{permission}</code>
                        </li>)}
                    </Typography>
                </>}
                <Typography variant="body2" className="font-semibold text-surface-900 dark:text-white">
                    💡 Recovery Option: You can bypass Google OAuth permissions entirely by using a Firebase Service Account JSON key.
                </Typography>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                        variant="filled"
                        onClick={() => {
                            navigate("/new/sa");
                        }}
                    >
                        Connect via Service Account Key
                    </Button>
                    {onRetry && (
                        <Button
                            variant="text"
                            onClick={() => onRetry()}
                        >
                            Retry Setup
                        </Button>
                    )}
                </div>
            </div>
        );
    } else if (code === "service-account-missing-permissions" || code === "user-missing-permissions") {
        return <ServiceAccountMissingPermissions missingPermissions={error.data?.missingPermissions}/>;
    }


    const isPermissionError =
        (code === "permission-denied" ||
        code === "permission_denied" ||
        (message && message.toLowerCase().includes("permission")) ||
        (message && message.toLowerCase().includes("caller does not have"))) && allowServiceAccountBypass;
    if (isPermissionError) {
        return (
            <div className="flex flex-col space-y-4 p-6 border border-surface-200 dark:border-surface-700 rounded-xl bg-surface-50 dark:bg-surface-900">
                <Typography variant="h6" className="text-red-600 dark:text-red-400">
                    Google Cloud Permission Error
                </Typography>
                <Typography variant="body2" color="secondary">
                    {message}
                </Typography>
                <Typography variant="body2" color="secondary">
                    This error usually occurs because your Google Cloud account does not have sufficient permissions (like Owner or IAM Admin roles) to enable services or automatically generate a service account.
                </Typography>
                <Typography variant="body2" className="font-semibold text-surface-900 dark:text-white">
                    💡 Recovery Option: You can bypass Google OAuth permissions entirely by using a Firebase Service Account JSON key.
                </Typography>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                        variant="filled"
                        onClick={() => {
                            navigate("/new/sa");
                        }}
                    >
                        Connect via Service Account Key
                    </Button>
                    {onRetry && (
                        <Button
                            variant="text"
                            onClick={() => onRetry()}
                        >
                            Retry Setup
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (<div className="flex flex-col space-y-2">
            <Typography className="text-red-600 dark:text-red-400">
                {message}
            </Typography>

            {error.data && Object.keys(error.data).length > 0 && <pre className="text-xs text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-surface-800 rounded-lg">
                {JSON.stringify(error.data, null, 2)}
            </pre>}

            {onRetry && <Button

                color="error"
                onClick={() => onRetry()}
            >
                Retry
            </Button>}
        </div>
    );
}

type ServiceAccountFailureCopy = {
    title: string,
    description: string,
    /**
     * Whether recreating the account is the right remedy. Enabling Auth or a
     * failed KMS decrypt need something else entirely, and offering a "Fix"
     * button that cannot work is worse than offering none.
     */
    recreatable: boolean
};

const SERVICE_ACCOUNT_FAILURES: Record<string, ServiceAccountFailureCopy> = {
    "service-account-absent": {
        title: "This project is not linked to a service account",
        description: "FireCMS needs a service account in your Google Cloud project to read and write your data on your behalf.",
        recreatable: true
    },
    "service-account-deleted": {
        title: "The FireCMS service account no longer exists",
        description: "The service account FireCMS uses was deleted from your Google Cloud project, so we can no longer connect to it. Recreating it restores access; your data is untouched.",
        recreatable: true
    },
    "service-account-key-invalid": {
        title: "The FireCMS service account key was revoked",
        description: "The account still exists in your Google Cloud project, but the key FireCMS holds is no longer valid. Generating a new key restores access.",
        recreatable: true
    },
    "service-account-disabled": {
        title: "The FireCMS service account is disabled",
        description: "The service account exists in your Google Cloud project but has been disabled, so it cannot be used. Recreating it restores access.",
        recreatable: true
    },
    "auth-not-configured": {
        title: "Authentication is not enabled on this project",
        description: "The service account works, but Firebase Authentication has never been enabled on your Google Cloud project. Enable it and then sign in again.",
        recreatable: false
    },
    "service-account-unreadable": {
        title: "We could not read this project's stored credentials",
        description: "The service account stored for this project could not be decrypted. This one is on our side, so please get in touch and we will sort it out.",
        recreatable: false
    }
};

const UNKNOWN_SERVICE_ACCOUNT_FAILURE: ServiceAccountFailureCopy = {
    title: "The service account linked to this project is not working",
    description: "FireCMS could not use the service account stored for this project. Recreating it usually resolves the problem.",
    recreatable: true
};

/**
 * What the user sees when the delegated service account is gone or unusable.
 *
 * The account lives in the *client's* Google Cloud project, so it can stop
 * working without anything changing on our side — someone tidying up IAM is
 * enough. The remedy is nearly always "recreate it", but that needs a Google
 * account with access to that project, which whoever hit the error may not
 * have. So this names what actually broke, offers the one-click fix, and when
 * the fix comes back refused, explains who has to do it instead.
 */
function ServiceAccountRecoveryView({
                                        fireCMSBackend,
                                        projectId,
                                        onFixed,
                                        reason,
                                        clientEmail
                                    }: {
    fireCMSBackend: FireCMSBackend,
    projectId: string,
    onFixed?: () => void,
    reason?: string,
    clientEmail?: string
}) {

    const { projectsApi } = useFireCMSBackend();
    const snackbarController = useSnackbarController();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingLogin, setPendingLogin] = useState(false);
    const [fixError, setFixError] = useState<Error | undefined>();

    const copy = (reason ? SERVICE_ACCOUNT_FAILURES[reason] : undefined) ?? UNKNOWN_SERVICE_ACCOUNT_FAILURE;

    const runFix = useCallback(async () => {
        const accessToken = fireCMSBackend.googleCredential?.accessToken;
        if (!accessToken) return;
        setIsSubmitting(true);
        setFixError(undefined);
        try {
            await projectsApi.createServiceAccount(accessToken, projectId, true);
            snackbarController.open({
                type: "success",
                message: "Service account recreated successfully"
            });
            onFixed?.();
        } catch (e) {
            // Previously this path reported success regardless, and the user was
            // sent back round the same failing login.
            setFixError(e as Error);
            snackbarController.open({
                type: "error",
                message: "Could not recreate the service account: " + (e as Error).message
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [fireCMSBackend.googleCredential?.accessToken, projectId, projectsApi, snackbarController, onFixed]);

    useEffect(() => {
        if (pendingLogin && fireCMSBackend.googleCredential?.accessToken) {
            setPendingLogin(false);
            runFix();
        }
    }, [pendingLogin, fireCMSBackend.googleCredential?.accessToken, runFix]);

    const onClick = () => {
        if (!fireCMSBackend.googleCredential?.accessToken) {
            // We need the cloud-platform scope to touch IAM, so send the user
            // back through Google with the admin scopes and fix once we return.
            setPendingLogin(true);
            fireCMSBackend.googleLogin(true);
        } else {
            runFix();
        }
    };

    const fixErrorCode = fixError instanceof ApiError ? fixError.code : undefined;
    const lacksProjectAccess = fixErrorCode === "no-access-to-project";
    const googleTokenExpired = fixErrorCode === "google-cloud-token-expired";

    return <div className="flex flex-col space-y-4 py-4">

        <div className="flex flex-col space-y-2">
            <Typography variant={"subtitle2"} color={"error"}>
                {copy.title}
            </Typography>
            <Typography variant={"body2"} color={"secondary"}>
                {copy.description}
            </Typography>
            {clientEmail && <code className="text-xs text-gray-500 dark:text-gray-400">
                {clientEmail}
            </code>}
        </div>

        {copy.recreatable && !lacksProjectAccess && <div className="flex flex-col space-y-2">
            <LoadingButton
                color="error"
                onClick={onClick}
                loading={isSubmitting}
                startIcon={<BuildIcon/>}
            >
                {googleTokenExpired ? "Sign in with Google and retry" : "Recreate service account"}
            </LoadingButton>
            <Typography variant={"caption"} color={"secondary"}>
                You need to be signed in with a Google account that can manage service
                accounts in the <code>{projectId}</code> Google Cloud project.
            </Typography>
        </div>}

        {copy.recreatable && lacksProjectAccess && <NoProjectAccessView projectId={projectId}
                                                                       onRetry={onClick}
                                                                       retrying={isSubmitting}/>}

        {reason === "auth-not-configured" && <ExternalConsoleLink
            href={`https://console.firebase.google.com/project/${projectId}/authentication/providers`}
            label={"Enable Authentication in the Firebase console"}/>}

        {reason === "service-account-unreadable" && <SupportLink/>}

        {fixError && !lacksProjectAccess && <Typography variant={"caption"} color={"error"}>
            {fixError.message}
        </Typography>}

    </div>;
}

/**
 * The common team case: the person who hit the broken login is not the person
 * who owns the Google Cloud project, so no button we show them can help.
 */
function NoProjectAccessView({
                                 projectId,
                                 onRetry,
                                 retrying
                             }: {
    projectId: string,
    onRetry: () => void,
    retrying: boolean
}) {
    return <div className="flex flex-col space-y-3 p-4 rounded-md border border-amber-500/30 bg-amber-500/5">
        <Typography variant={"subtitle2"} className={"text-amber-700 dark:text-amber-400"}>
            Your Google account cannot fix this project
        </Typography>
        <Typography variant={"body2"} color={"secondary"}>
            The account you signed in with does not have access to the <code>{projectId}</code> Google
            Cloud project, so it cannot recreate the service account. Ask someone with
            the <strong>Owner</strong> role (or any role granting <code>iam.serviceAccounts.create</code>)
            on that project to open this page and press the button, and access will be restored for everyone.
        </Typography>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Button variant={"text"}
                    size={"small"}
                    onClick={onRetry}
                    disabled={retrying}>
                Try again with a different account
            </Button>
            <ExternalConsoleLink
                href={`https://console.cloud.google.com/iam-admin/serviceaccounts?project=${projectId}`}
                label={"Open the service accounts console"}/>
        </div>
    </div>;
}

function ExternalConsoleLink({
                                 href,
                                 label
                             }: {
    href: string,
    label: string
}) {
    return <a href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm font-semibold text-primary hover:underline gap-1">
        {label} <OpenInNewIcon size="smallest"/>
    </a>;
}

function SupportLink() {
    return <Typography variant={"body2"} color={"secondary"}>
        Reach us at <a className="text-primary dark:text-primary-light underline"
                       href="mailto:hello@firecms.co?subject=FireCMS%20service%20account%20error"
                       rel="noopener noreferrer"
                       target="_blank">hello@firecms.co</a> and we will get this project back up.
    </Typography>;
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
                className="text-primary dark:text-primary-light underline"
                rel="noopener noreferrer"
                target="_blank"
                href={"https://console.cloud.google.com/welcome?project=" + projectId}>
                {`https://console.cloud.google.com/welcome?project=${projectId}`}
            </a>
        </Typography>
        <Button

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
                className="text-primary dark:text-primary-light underline"
                rel="noopener noreferrer"
                target="_blank"
                href={"https://console.firebase.google.com/"}>
                {"https://console.firebase.google.com/"}
            </a>
        </Typography>

        <Button

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
