import React, { useEffect } from "react";
import { createMuiTheme, CssBaseline, ThemeProvider } from "@material-ui/core";

import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";

import "typeface-space-mono";

import CircularProgressCenter from "./components/CircularProgressCenter";
import { Authenticator } from "./models";
import { blue, pink, red } from "@material-ui/core/colors";
import { AuthContext, AuthProvider } from "./contexts/AuthContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { CMSAppContextProvider } from "./contexts/CMSAppContext";
import { CMSAppProps } from "./CMSAppProps";
import { LoginView } from "./LoginView";
import { CMSMainView } from "./CMSMainView";
import { NavigationProvider } from "./contexts/NavigationProvider";


export function CMSApp(props: CMSAppProps) {

    const {
        name,
        logo,
        navigation,
        authentication,
        allowSkipLogin,
        firebaseConfig,
        onFirebaseInit,
        primaryColor,
        secondaryColor,
        fontFamily,
        toolbarExtraWidget,
        schemaResolver,
        locale,
        signInOptions = [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ]
    } = props;

    const mode: "light" | "dark" = "light";
    const makeTheme = () => {

        const original = createMuiTheme({
            palette: {
                type: mode,
                background: {
                    // @ts-ignore
                    default: mode === "dark" ? "#424242" : "#f6f8f9"
                },
                primary: {
                    main: primaryColor ? primaryColor : blue["800"]
                },
                secondary: {
                    main: secondaryColor ? secondaryColor : pink["400"]
                },
                error: {
                    main: red.A400
                }
            },
            typography: {
                "fontFamily": fontFamily ? fontFamily : `"Rubik", "Roboto", "Helvetica", "Arial", sans-serif`,
                fontWeightMedium: 500
            },
            overrides: {
                MuiButton: {
                    root: {
                        borderRadius: 4
                    }
                },
                MuiTableRow: {
                    root: {
                        "&:last-child td": {
                            borderBottom: 0
                        }
                    }
                },
                MuiTypography: {
                    root: {
                        "&.mono": {
                            fontFamily: "'Space Mono', 'Lucida Console', monospace"
                        },
                        "&.weight-500": {
                            fontWeight: 500
                        }
                    }
                },
                MuiInputLabel: {
                    formControl: {
                        top: 0,
                        left: 0,
                        position: "absolute",
                        transform: "translate(0, 16px) scale(1)"
                    }
                },
                MuiInputBase: {
                    formControl: {
                        minHeight: "64px"
                    },
                    root: {
                        "&.mono": {
                            fontFamily: "'Space Mono', 'Lucida Console', monospace"
                        }
                    }
                },
                MuiFormControlLabel: {
                    label: {
                        width: "100%"
                    }
                }
            }
        });

        return {
            ...original,
            shadows: original.shadows.map((value, index) => {
                if (index == 1) return "0 1px 1px 0 rgb(0 0 0 / 16%)";
                else return value;
            })
        };
    };
    const theme = makeTheme();

    const [
        firebaseConfigInitialized,
        setFirebaseConfigInitialized
    ] = React.useState<boolean>(false);

    const [usedFirebaseConfig, setUsedFirebaseConfig] = React.useState<Object>();
    const [configError, setConfigError] = React.useState<string>();
    const [firebaseConfigError, setFirebaseConfigError] = React.useState<boolean>(false);

    const authenticationEnabled = authentication === undefined || !!authentication;
    const skipLoginButtonEnabled = authenticationEnabled && allowSkipLogin;

    const authenticator: Authenticator | undefined
        = authentication instanceof Function ? authentication : undefined;

    function initFirebase(config: Object) {
        if (firebase.apps.length === 0)
            try {
                firebase.initializeApp(config);
                firebase.analytics();
                setUsedFirebaseConfig(config);
                setFirebaseConfigError(false);
                setFirebaseConfigInitialized(true);
                if (onFirebaseInit)
                    onFirebaseInit(config);
            } catch (e) {
                console.error(e);
                setFirebaseConfigError(true);
            }
    }

    useEffect(() => {

        if (firebase.apps.length > 0)
            return;

        if (firebaseConfig) {
            console.log("Using specified config", firebaseConfig);
            initFirebase(firebaseConfig);
        } else if (process.env.NODE_ENV === "production") {
            fetch("/__/firebase/init.json")
                .then(async response => {
                    console.debug("Firebase init response", response.status);
                    if (response && response.status < 300) {
                        const config = await response.json();
                        console.log("Using configuration fetched from Firebase Hosting", config);
                        initFirebase(config);
                    }
                })
                .catch(e =>
                    setConfigError(
                        "Could not load Firebase configuration from Firebase hosting. " +
                        "If the app is not deployed in Firebase hosting, you need to specify the configuration manually" +
                        e.toString()
                    )
                );
        } else {
            setConfigError(
                "You need to deploy the app to Firebase hosting or specify a Firebase configuration object"
            );
        }
    }, []);

    if (configError) {
        return <div> {configError} </div>;
    }

    if (firebaseConfigError) {
        return <>
            <div>
                It seems like the provided Firebase config is not correct. If
                you
                are using the credentials provided automatically by Firebase
                Hosting, make sure you link your Firebase app to Firebase
                Hosting.
            </div>
            <div>
                {JSON.stringify(firebaseConfigError)}
            </div>
        </>;
    }

    if (!firebaseConfigInitialized || !usedFirebaseConfig) {
        return <CircularProgressCenter/>;
    }

    return usedFirebaseConfig &&

            <ThemeProvider theme={theme}>
                <SnackbarProvider>
                    <AuthProvider authenticator={authenticator}
                                  firebaseConfigInitialized={firebaseConfigInitialized}>
                        <AuthContext.Consumer>
                            {(authContext) => {

                                const hasAccessToMainView = !authenticationEnabled || authContext.loggedUser || authContext.loginSkipped;

                                return (<>

                                        <CssBaseline/>

                                        {authContext.authLoading ?
                                            <CircularProgressCenter/>
                                            : (
                                                hasAccessToMainView ?
                                                    <NavigationProvider
                                                        navigationOrCollections={navigation}
                                                        user={authContext.loggedUser}>
                                                        <CMSMainView {...props} usedFirebaseConfig={usedFirebaseConfig}/>
                                                    </NavigationProvider>
                                                    :
                                                    <LoginView logo={logo}
                                                               skipLoginButtonEnabled={skipLoginButtonEnabled}
                                                               signInOptions={signInOptions}
                                                               firebaseConfig={usedFirebaseConfig}/>
                                            )
                                        }

                                    </>
                                );
                            }}

                        </AuthContext.Consumer>
                    </AuthProvider>
                </SnackbarProvider>
            </ThemeProvider>;

}
