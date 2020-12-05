import React, { useEffect } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
    Box,
    createMuiTheme,
    createStyles,
    CssBaseline,
    makeStyles,
    Theme,
    ThemeProvider
} from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

import { BrowserRouter as Router } from "react-router-dom";

import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";

import "./styles.module.css";

import { CircularProgressCenter } from "./components";
import { Authenticator } from "./authenticator";
import { blue, pink, red } from "@material-ui/core/colors";

import { SelectedEntityProvider } from "./side_dialog/SelectedEntityContext";
import { BreadcrumbsProvider } from "./contexts/BreacrumbsContext";
import { AuthContext, AuthProvider } from "./contexts/AuthContext";
import { SnackbarProvider } from "./contexts/SnackbarContext";
import { AppConfigProvider } from "./contexts/AppConfigContext";

import { DndProvider } from "react-dnd";
import { CMSAppProps } from "./CMSAppProps";
import { LoginView } from "./LoginView";
import { CMSDrawer } from "./CMSDrawer";
import { CMSRouterSwitch } from "./CMSRouterSwitch";
import { CMSAppBar } from "./components/CMSAppBar";
import { EntitySideDialogs } from "./side_dialog/EntitySideDialogs";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        logo: {
            padding: theme.spacing(3),
            maxWidth: 240
        },
        main: {
            display: "flex",
            flexDirection: "column",
            width: "100vw",
            height: "100vh"
        },
        content: {
            flexGrow: 1,
            width: "100%",
            height: "100%",
            overflow: "auto"
        },
        tableNoBottomBorder: {
            "&:last-child th, &:last-child td": {
                borderBottom: 0
            }
        },
        filter: {
            flexGrow: 1,
            padding: theme.spacing(1)
        },
        tree: {
            height: 216,
            flexGrow: 1,
            maxWidth: 400
        }
    })
);

export function CMSApp(props: CMSAppProps) {

    const {
        name,
        logo,
        navigation,
        authentication,
        allowSkipLogin,
        firebaseConfig,
        additionalViews,
        primaryColor,
        secondaryColor,
        fontFamily,
        toolbarExtraWidget
    } = props;

    const classes = useStyles();
    const theme = createMuiTheme({
        palette: {
            background: {
                default: "#f6f8f9"
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
            "fontFamily": fontFamily ? fontFamily : `"Rubik", "Roboto", "Helvetica", "Arial", sans-serif`
        },
        shape: {
            borderRadius: 2
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
                }
            },
            MuiFormControlLabel: {
                label: {
                    width: "100%"
                }
            },
            MuiDialog: {
                paper: {
                    height: "100%"
                }
            }
        }
    });

    const [drawerOpen, setDrawerOpen] = React.useState(false);

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
        try {
            firebase.initializeApp(config);
            firebase.analytics();
            setUsedFirebaseConfig(config);
            setFirebaseConfigError(false);
            setFirebaseConfigInitialized(true);
        } catch (e) {
            console.error(e);
            setFirebaseConfigError(true);
        }
    }

    useEffect(() => {
        if (firebaseConfig) {
            initFirebase(firebaseConfig);
        } else if (process.env.NODE_ENV === "production") {
            fetch("/__/firebase/init.json")
                .then(async response => {
                    console.log("Firebase init response", response.status);
                    if (response && response.status < 300) {
                        const config = await response.json();
                        console.log("Using config", config);
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

    const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
    const closeDrawer = () => setDrawerOpen(false);

    function renderLoginView() {
        return <LoginView logo={logo}
                          skipLoginButtonEnabled={skipLoginButtonEnabled}/>;
    }

    function renderMainView() {
        return (
            <Router>
                <SelectedEntityProvider>
                    <BreadcrumbsProvider>
                        <MuiPickersUtilsProvider
                            utils={DateFnsUtils}>
                            <DndProvider backend={HTML5Backend}>
                                <nav>
                                    <CMSDrawer logo={logo}
                                               drawerOpen={drawerOpen}
                                               navigation={navigation}
                                               closeDrawer={closeDrawer}
                                               additionalViews={additionalViews}/>
                                </nav>

                                <Box
                                    className={classes.main}>
                                    <CssBaseline/>
                                    <CMSAppBar title={name}
                                               handleDrawerToggle={handleDrawerToggle}
                                               toolbarExtraWidget={toolbarExtraWidget}/>

                                    <main
                                        className={classes.content}>
                                        <CMSRouterSwitch
                                            navigation={navigation}
                                            additionalViews={additionalViews}/>
                                    </main>
                                </Box>

                                <EntitySideDialogs
                                    navigation={navigation}/>

                            </DndProvider>
                        </MuiPickersUtilsProvider>
                    </BreadcrumbsProvider>
                </SelectedEntityProvider>
            </Router>
        );
    }


    if (configError) {
        return <Box> {configError} </Box>;
    }

    if (firebaseConfigError) {
        return <Box>
            It seems like the provided Firebase config is not correct. If you
            are using the credentials provided automatically by Firebase
            Hosting, make sure you link your Firebase app to Firebase
            Hosting.
        </Box>;
    }

    if (!firebaseConfigInitialized || !usedFirebaseConfig) {
        return <CircularProgressCenter/>;
    }

    return usedFirebaseConfig &&
        <AppConfigProvider cmsAppConfig={props}
                           firebaseConfig={usedFirebaseConfig}>

            <ThemeProvider theme={theme}>
                <SnackbarProvider>
                    <AuthProvider authenticator={authenticator}
                                  firebaseConfigInitialized={firebaseConfigInitialized}>
                        <AuthContext.Consumer>
                            {(authContext) => {

                                const hasAccessToMainView = !authenticationEnabled || authContext.loggedUser || authContext.loginSkipped;

                                return (
                                    authContext.authLoading ?
                                        <CircularProgressCenter/>
                                        : (
                                            hasAccessToMainView ?
                                                renderMainView()
                                                :
                                                renderLoginView()
                                        )
                                );

                            }

                            }
                        </AuthContext.Consumer>
                    </AuthProvider>
                </SnackbarProvider>
            </ThemeProvider>
        </AppConfigProvider>;

}

