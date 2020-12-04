import React, { useEffect } from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
    Box,
    Button,
    createMuiTheme,
    createStyles,
    CssBaseline,
    Grid,
    makeStyles,
    Theme,
    ThemeProvider
} from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

import {
    BrowserRouter as Router,
    Redirect,
    Route,
    Switch,
    useLocation
} from "react-router-dom";
import firebase from 'firebase/app';

import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";

import { CircularProgressCenter } from "./components";
import { EntityCollectionView } from "./models";
import { addInitialSlash, buildCollectionPath } from "./routes/navigation";
import { Authenticator } from "./authenticator";
import { blue, pink, red } from "@material-ui/core/colors";
import { SelectedEntityProvider } from "./side_dialog/SelectedEntityContext";

import "./styles.module.css";
import { BreadcrumbsProvider } from "./BreacrumbsContext";
import { CMSAppBar } from "./components/CMSAppBar";
import { AuthContext, AuthProvider } from "./auth";
import { SnackbarProvider } from "./snackbar_controller";
import { CMSRoute } from "./routes/CMSRoute";
import { DndProvider } from "react-dnd";
import { AdditionalView, CMSAppProps } from "./CMSAppProps";
import { AppConfigProvider } from "./AppConfigContext";
import { CMSDrawer } from "./CMSDrawer";
import { EntitySideDialogs } from "./side_dialog/EntitySideDialogs";
import AdditionalViewRoute from "./routes/AdditionalViewRoute";

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

    return <AuthProvider authenticator={authenticator}
                         firebaseConfigInitialized={firebaseConfigInitialized}>
        <AuthContext.Consumer>
            {(authContext) => {

                const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
                const closeDrawer = () => setDrawerOpen(false);

                function renderLoginView() {
                    return (
                        <Grid
                            container
                            spacing={0}
                            direction="column"
                            alignItems="center"
                            justify="center"
                            style={{ minHeight: "100vh" }}
                        >
                            <Box m={1}>
                                {logo &&
                                <img className={classes.logo} src={logo}
                                     alt={"Logo"}/>}
                            </Box>

                            <Button variant="contained"
                                    color="primary"
                                    onClick={authContext.googleSignIn}>
                                Google login
                            </Button>

                            {skipLoginButtonEnabled &&
                            <Box m={2}>
                                <Button onClick={authContext.skipLogin}>Skip
                                    login</Button>
                            </Box>
                            }

                            <Grid item xs={12}>

                                {/* TODO: add link to https://console.firebase.google.com/u/0/project/[PROYECT_ID]/authentication/providers in order to enable google */}
                                {/* in case the error code is auth/operation-not-allowed */}

                                {authContext.notAllowedError &&
                                <Box p={2}>It looks like you don't have access
                                    to
                                    the CMS,
                                    based
                                    on the specified Authenticator
                                    configuration</Box>}

                                {authContext.authProviderError &&
                                <Box p={2}>
                                    {authContext.authProviderError.message}
                                </Box>}

                            </Grid>
                        </Grid>
                    );
                }

                function renderMainView() {
                    if (configError) {
                        return <Box> {configError} </Box>;
                    }

                    if (!firebaseConfigInitialized) {
                        return <CircularProgressCenter/>;
                    }

                    return usedFirebaseConfig &&
                        <AppConfigProvider cmsAppConfig={props}
                                           firebaseConfig={usedFirebaseConfig}>
                            <Router>
                                <SelectedEntityProvider>
                                    <BreadcrumbsProvider>
                                        <SnackbarProvider>

                                            <nav>
                                                <CMSDrawer logo={logo}
                                                           drawerOpen={drawerOpen}
                                                           navigation={navigation}
                                                           closeDrawer={closeDrawer}
                                                           additionalViews={additionalViews}/>
                                            </nav>

                                            <Box className={classes.main}>
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

                                        </SnackbarProvider>
                                    </BreadcrumbsProvider>
                                </SelectedEntityProvider>
                            </Router>
                        </AppConfigProvider>;
                }

                return (
                    <ThemeProvider theme={theme}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <DndProvider backend={HTML5Backend}>
                                {firebaseConfigError ?
                                    <Box>
                                        It seems like the provided Firebase
                                        config
                                        is not correct. If you are using the
                                        credentials provided automatically by
                                        Firebase Hosting, make sure you link
                                        your
                                        Firebase app to Firebase Hosting.
                                    </Box> :
                                    (
                                        authContext.authLoading ? (
                                            <CircularProgressCenter/>
                                        ) : (!authenticationEnabled || authContext.loggedUser || authContext.loginSkipped) ? (
                                            renderMainView()
                                        ) : (
                                            renderLoginView()
                                        )
                                    )}
                            </DndProvider>
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>
                );
            }

            }
        </AuthContext.Consumer>
    </AuthProvider>;

}

function CMSRouterSwitch({ navigation, additionalViews }: {
    navigation: EntityCollectionView[],
    additionalViews?: AdditionalView[];
}) {

    const location = useLocation();
    const mainLocation = location.state && location.state["main_location"] ? location.state["main_location"] : location;

    const firstCollectionPath = buildCollectionPath(navigation[0].relativePath);

    return (
        <Switch location={mainLocation}>

            {navigation.map(entityCollectionView => (
                    <Route
                        path={buildCollectionPath(entityCollectionView.relativePath)}
                        key={`navigation_${entityCollectionView.relativePath}`}>
                        <CMSRoute
                            type={"collection"}
                            collectionPath={entityCollectionView.relativePath}
                            view={entityCollectionView}
                        />
                    </Route>
                )
            )}

            {additionalViews &&
            additionalViews.map(additionalView => (
                <Route
                    key={"additional_view_" + additionalView.path}
                    path={addInitialSlash(additionalView.path)}
                >
                    <AdditionalViewRoute
                        additionalView={additionalView}
                    />
                </Route>
            ))}

            <Redirect to={firstCollectionPath}/>

        </Switch>
    );
}

