import { useSnackbarController } from "@firecms/core";
import { Button, CenteredView, LoadingButton, OpenInNewIcon, Typography } from "@firecms/ui";
import { ApiError, CloudErrorView, FireCMSBackend } from "@firecms/cloud";
import authImage from "./auth.png";
import { verifyAuthIsEnabled } from "../../api/gcp_projects";
import React, { useCallback, useEffect } from "react";
import { ServiceAccount } from "../../types/service_account";

export function EnableAuthView({
                                   onAuthEnabled,
                                   projectId,
                                   fireCMSBackend,
                                   fullScreen = false,
                                   serviceAccount
                               }: {
    onAuthEnabled: () => void,
    projectId: string;
    fireCMSBackend: FireCMSBackend,
    fullScreen?: boolean,
    serviceAccount?: ServiceAccount
}) {

    const [consoleLinkClicked, setConsoleLinkClicked] = React.useState(false);
    const [loading, setLoading] = React.useState<boolean>();
    const [error, setError] = React.useState<ApiError | undefined>(undefined);

    const snackbarController = useSnackbarController()

    const verifyAuth = useCallback(async (notify: boolean) => {
        if (!fireCMSBackend.googleCredential?.accessToken && !serviceAccount)
            throw new Error("EnableAuthView: Google credential not found");
        setLoading(true);
        const accessToken = fireCMSBackend.googleCredential?.accessToken;
        const firebaseAccessToken = await fireCMSBackend.getBackendAuthToken();
        verifyAuthIsEnabled({
            projectId,
            googleAccessToken: accessToken,
            serviceAccount,
            firebaseAccessToken
        })
            .then((enabled) => {
                if (enabled)
                    onAuthEnabled();
                else if (notify)
                    snackbarController.open({
                        type: "warning",
                        message: "Authentication is not enabled in this project yet"
                    })
            })
            .catch(setError)
            .finally(() => setLoading(false));
    }, [fireCMSBackend.googleCredential?.accessToken, serviceAccount, onAuthEnabled, projectId, snackbarController]);

    useEffect(() => {
        const listener = () => verifyAuth(false);
        window.addEventListener("focus", listener, false);
        return () => window.removeEventListener("focus", listener);
    }, [verifyAuth])

    return <CenteredView maxWidth={"6xl"}>

        <div className={"grid grid-cols-12 gap-4"}>

            <div className={"col-span-12 md:col-span-6"}>
                <CenteredView maxWidth={"3xl"}>
                    <img
                        src={authImage}
                        style={{ borderRadius: 8 }}
                        width={"100%"}
                        alt="Firebase auth"
                    />
                </CenteredView>
            </div>

            <div className={"col-span-12 md:col-span-6"}>
                <div className="flex flex-col gap-4 p-4 m-auto">
                    <Typography variant={"h4"}>
                        Enable authentication
                    </Typography>
                    <Typography>
                        There is only one manual step left in order to start
                        using
                        FireCMS: you need to enable authentication in your
                        project.
                    </Typography>
                    <Typography>
                        This is done by clicking on
                        the <strong>Get started</strong> button
                        in the <strong>Authentication</strong> section of your
                        Firebase console.
                    </Typography>
                    <Button
                        variant={consoleLinkClicked ? "outlined" : "filled"}
                        rel="noopener noreferrer"
                        target="_blank"
                        component={"a"}
                        startIcon={<OpenInNewIcon/>}
                        onClick={() => setConsoleLinkClicked(true)}
                        href={"https://console.firebase.google.com/project/" + projectId + "/authentication"}>
                        Go to Firebase console
                    </Button>
                    <Typography>
                        You just need to click on <strong>Get started</strong>,
                        no need to
                        add additional auth providers for FireCMS to work
                        properly
                    </Typography>
                    <LoadingButton
                        variant={consoleLinkClicked ? "filled" : "outlined"}
                        loading={loading}
                        onClick={() => verifyAuth(false)}>
                        Verify authentication is enabled
                    </LoadingButton>

                    {error && <CloudErrorView error={error}
                                              fireCMSBackend={fireCMSBackend}/>}
                </div>
            </div>

        </div>
    </CenteredView>;
}
