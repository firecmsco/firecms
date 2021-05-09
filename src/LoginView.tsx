import React, { useEffect } from "react";
import {
    Box,
    Button,
    createStyles,
    Grid,
    makeStyles,
    Theme
} from "@material-ui/core";

import firebase from "firebase";
import "firebase/auth";

import { useAuthContext, useCMSAppContext } from "./contexts";

import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        logo: {
            padding: theme.spacing(3),
            maxWidth: 260
        }
    })
);

interface LoginViewProps {
    skipLoginButtonEnabled?: boolean,
    logo?: string,
    // Any of the sign in string or configuration objects defined in https://firebase.google.com/docs/auth/web/firebaseui
    signInOptions: Array<string | any>;
    firebaseConfig:Object;
}

export function LoginView({
                              skipLoginButtonEnabled,
                              logo,
                              signInOptions,
                              firebaseConfig
                          }: LoginViewProps) {
    const { t } = useTranslation();
    const classes = useStyles();

    const authController = useAuthContext();

    useEffect(() => {
        const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());

        const uiConfig: firebaseui.auth.Config = {
            callbacks: {
                signInSuccessWithAuthResult: (authResult) => {
                    authController.setAuthResult(authResult);
                    return true;
                },
                uiShown: () => authController.setAuthLoading(false),
                signInFailure: async (e) => {
                    console.error("signInFailure", e);
                    authController.setAuthProviderError(e);
                }
            },
            signInFlow: "popup",
            signInOptions: signInOptions,
            credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO
        };
        ui.start("#firebase-ui", uiConfig);
    });

    function buildErrorView() {
        let errorView: any;
        if (authController.authProviderError) {
            if (authController.authProviderError.code === "auth/operation-not-allowed") {
                errorView =
                    <>
                        <Box p={2}>
                            {t("errorEnableLoginProvider")}
                        </Box>

                        {firebaseConfig &&
                        <Box p={2}>
                            <a href={`https://console.firebase.google.com/project/${(firebaseConfig as any)["projectId"]}/authentication/providers`}
                               rel="noopener noreferrer"
                               target="_blank">
                                <Button variant="outlined"
                                        color="primary">
                                    {t("openFirebaseConfiguration")}
                                </Button>
                            </a>
                        </Box>}
                    </>;
            } else {
                errorView =
                    <Box p={2}>
                        {authController.authProviderError.message}
                    </Box>;
            }
        }
        return errorView;
    }

    return (
        <Grid
            container
            spacing={1}
            direction="column"
            alignItems="center"
            justify="center"
            style={{ minHeight: "100vh" }}
        >
            <Box m={1}>
                {logo &&
                <img className={classes.logo}
                     src={logo}
                     alt={"Logo"}/>}
            </Box>

            <div id="firebase-ui"/>

            {skipLoginButtonEnabled &&
            <Box m={2}>
                <Button onClick={authController.skipLogin}>
                    {t("skipLogin")}
                </Button>
            </Box>
            }

            <Grid item xs={12}>

                {authController.notAllowedError &&
                <Box p={2}>
                    {t("errorNoAccessToCms")}
                </Box>}

                {buildErrorView()}

            </Grid>
        </Grid>
    );
}
