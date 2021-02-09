import React, { useEffect } from "react";
import { Box, Button, Grid, Theme } from "@material-ui/core";

import createStyles from '@material-ui/styles/createStyles';
import makeStyles from '@material-ui/styles/makeStyles';

import firebase from "firebase/app";
import "firebase/auth";

import { useAuthController } from "../contexts";

import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";

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
    firebaseConfig: Object;
}

export function LoginView({
                              skipLoginButtonEnabled,
                              logo,
                              signInOptions,
                              firebaseConfig
                          }: LoginViewProps) {

    const classes = useStyles();

    const authController = useAuthController();

    useEffect(() => {
        const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());

        const uiConfig: firebaseui.auth.Config = {
            callbacks: {
                signInSuccessWithAuthResult: (authResult) => {
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
                            You need to enable the corresponding login provider
                            in
                            your Firebase project
                        </Box>

                        {firebaseConfig &&
                        <Box p={2}>
                            <a href={`https://console.firebase.google.com/project/${(firebaseConfig as any)["projectId"]}/authentication/providers`}
                               rel="noopener noreferrer"
                               target="_blank">
                                <Button variant="outlined"
                                        color="primary">
                                    Open Firebase configuration
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
            justifyContent="center"
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
                    Skip login
                </Button>
            </Box>
            }

            <Grid item xs={12}>

                {authController.notAllowedError &&
                <Box p={2}>
                    It looks like you don't have access to the CMS, based
                    on the specified Authenticator configuration
                </Box>}

                {buildErrorView()}

            </Grid>
        </Grid>
    );
}
