import React, { useEffect } from "react";
import { Box, Button, Grid, Theme } from "@mui/material";

import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";

import { FirebaseApp } from "firebase/app";
import { FireCMSLogo } from "../../core/components/FireCMSLogo";
import { AuthDelegate } from "../../models";
import { useAuthController } from "../../hooks";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        logo: {
            padding: theme.spacing(3),
            maxWidth: 260
        }
    })
);

/**
 * @category Firebase
 */
export interface FirebaseLoginViewProps {
    skipLoginButtonEnabled?: boolean,
    logo?: string,
    // Any of the sign in string or configuration objects defined in https://firebase.google.com/docs/auth/web/firebaseui
    signInOptions: Array<string | any>;
    firebaseApp: FirebaseApp;
    authDelegate: AuthDelegate
}

/**
 * Use this component to render a login view based on FirebaseUI, that updates
 * the state of the {@link AuthController} based on the result
 * @constructor
 * @category Firebase
 */
export function FirebaseLoginView({
                                      skipLoginButtonEnabled,
                                      logo,
                                      signInOptions,
                                      firebaseApp,
                                      authDelegate
                                  }: FirebaseLoginViewProps) {
    const classes = useStyles();
    const authController = useAuthController();

    useEffect(() => {
        if (firebase.apps.length === 0) {
            try {
                firebase.initializeApp(firebaseApp.options);
            } catch (e) {
                console.error(e);
            }
        }

        const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());

        const uiConfig: firebaseui.auth.Config = {
            callbacks: {
                signInSuccessWithAuthResult: (authResult) => {
                    return true;
                },
                signInFailure: async (e) => {
                    console.error("signInFailure", e);
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
        if (authDelegate.authError) {
            if (authDelegate.authError.code === "auth/operation-not-allowed") {
                errorView =
                    <>
                        <Box p={2}>
                            You need to enable the corresponding login provider
                            in your Firebase project
                        </Box>

                        {firebaseApp &&
                        <Box p={2}>
                            <a href={`https://console.firebase.google.com/project/${firebaseApp.options.projectId}/authentication/providers`}
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
                        {authDelegate.authError.message}
                    </Box>;
            }
        }
        return errorView;
    }

    let logoComponent;
    if (logo) {
        logoComponent = <img className={classes.logo}
                             src={logo}
                             alt={"Logo"}/>;
    } else {
        logoComponent = <div className={classes.logo}>
            <FireCMSLogo/>
        </div>;
    }

    let notAllowedMessage: string | undefined;
    if (authController.notAllowedError) {
        if (typeof authController.notAllowedError === "string") {
            notAllowedMessage = authController.notAllowedError;
        } else {
            notAllowedMessage = "It looks like you don't have access to the CMS, based on the specified Authenticator configuration";
        }
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
                {logoComponent}
            </Box>

            <div id="firebase-ui"/>

            {skipLoginButtonEnabled &&
            <Box m={2}>
                <Button onClick={authDelegate.skipLogin}>
                    Skip login
                </Button>
            </Box>
            }

            <Grid item xs={12}>

                {notAllowedMessage &&
                <Box p={2}>
                    {notAllowedMessage}
                </Box>}

                {buildErrorView()}

            </Grid>
        </Grid>
    );
}
