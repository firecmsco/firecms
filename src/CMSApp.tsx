import React, { useEffect } from "react";
import {
    Box,
    Button,
    createStyles,
    CssBaseline,
    Divider,
    Drawer,
    Grid,
    List,
    ListItem,
    ListItemText,
    makeStyles,
    Theme
} from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import {
    BrowserRouter as Router,
    Link as ReactLink,
    Redirect,
    Route,
    Switch,
    useLocation
} from "react-router-dom";

import * as firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";

import { CircularProgressCenter } from "./components";
import { EntityCollectionView } from "./models";
import { addInitialSlash, buildCollectionPath } from "./routes";
import { Authenticator } from "./authenticator";
import { blue, pink, red } from "@material-ui/core/colors";
import { FirebaseConfigContext } from "./contexts";
import { SelectedEntityProvider } from "./SelectedEntityContext";

import "./styles.module.css";
import { BreadcrumbsProvider } from "./BreacrumbsContext";
import { CMSAppBar } from "./components/CMSAppBar";
import { AuthContext, AuthProvider } from "./auth";
import { SnackbarProvider } from "./snackbar_controller";
import { CMSRoute } from "./routes/CMSRoute";
import EntityDetailDialog from "./routes/SideCMSRoute";

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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
        logo: {
            padding: theme.spacing(3),
            maxWidth: drawerWidth
        },
        drawerPaper: {
            width: drawerWidth
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

/**
 * Main entry point that defines the CMS configuration
 */
export interface CMSAppProps {
    /**
     * Name of the service, displayed as the main title and in the tab title
     */
    name: string;

    /**
     * Logo to be displayed in the drawer of the CMS
     */
    logo?: string;

    /**
     * List of the views in the CMS. Each view relates to a collection in the
     * root Firestore database. Each of the navigation entries in this field
     * generates an entry in the main menu.
     */
    navigation: EntityCollectionView<any>[];

    /**
     * Do the users need to log in to access the CMS.
     * You can specify an Authenticator function to discriminate which users can
     * access the CMS or not.
     * If not specified authentication is enabled but no user restrictions apply
     */
    authentication?: boolean | Authenticator;

    /**
     * If authentication is enabled, allow the user to access the content
     * without login.
     */
    allowSkipLogin?: boolean;

    /**
     * Custom additional views created by the developer, added to the main
     * navigation
     */
    additionalViews?: AdditionalView[];

    /**
     * Firebase configuration of the project. If you afe deploying the app to
     * Firebase hosting, you don't need to specify this value
     */
    firebaseConfig?: Object;

    /**
     * Primary color of the theme of the CMS
     */
    primaryColor?: string;

    /**
     * Primary color of the theme of the CMS
     */
    secondaryColor?: string

    /**
     * Font family string
     * e.g.
     * '"Roboto", "Helvetica", "Arial", sans-serif'
     */
    fontFamily?: string

    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    toolbarExtraWidget?: React.ReactNode;

}

/**
 * Custom additional views created by the developer, added to the main
 * navigation
 */
export interface AdditionalView {
    /**
     * CMS Path
     */
    path: string;

    /**
     * Name of this view
     */
    name: string;

    /**
     * Component to be rendered
     */
    view: React.ReactNode;
}


export function CMSApp({
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
                           toolbarExtraWidget,
                           ...props
                       }: CMSAppProps) {
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
            setFirebaseConfigError(false);
            setFirebaseConfigInitialized(true);
        } catch (e) {
            console.error(e);
            setFirebaseConfigError(true);
        }
    }

    useEffect(() => {
        if (process.env.NODE_ENV === "production") {
            fetch("/__/firebase/init.json")
                .then(async response => {
                    console.log("Firebase init response", response.status);
                    if (response && response.status < 300) {
                        const config = await response.json();
                        console.log(config);
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
        } else if (firebaseConfig) {
            initFirebase(firebaseConfig);
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
                                <img className={classes.logo} src={logo}/>}
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

                    const drawer = (
                        <React.Fragment>

                            {logo &&
                            <img className={classes.logo} src={logo}/>}

                            <Divider/>
                            <List>
                                {Object.entries(navigation).map(([key, view], index) => (
                                    <ListItem
                                        button
                                        key={`navigation_${index}_${key}`}
                                        component={ReactLink}
                                        to={buildCollectionPath(view.relativePath)}
                                    >
                                        <ListItemText
                                            primary={view.name.toUpperCase()}
                                            primaryTypographyProps={{ variant: "subtitle2" }}
                                            onClick={closeDrawer}/>
                                    </ListItem>
                                ))}

                                {additionalViews && (
                                    <React.Fragment>
                                        <Divider/>
                                        {additionalViews.map(additionalView => (
                                            <ListItem
                                                button
                                                key={`additional-view-${additionalView.path}`}
                                                component={ReactLink}
                                                to={addInitialSlash(additionalView.path)}
                                            >
                                                <ListItemText
                                                    primary={additionalView.name}
                                                    primaryTypographyProps={{ variant: "subtitle2" }}/>
                                            </ListItem>
                                        ))}
                                    </React.Fragment>
                                )}
                            </List>

                            <EntityDetailDialog navigation={navigation}/>

                        </React.Fragment>
                    );

                    return (
                        <FirebaseConfigContext.Provider value={firebaseConfig}>
                            <Router>
                                <SelectedEntityProvider>
                                    <BreadcrumbsProvider>
                                        <SnackbarProvider>

                                            <nav>
                                                <Drawer
                                                    variant="temporary"
                                                    anchor={"left"}
                                                    open={drawerOpen}
                                                    onClose={closeDrawer}
                                                    classes={{
                                                        paper: classes.drawerPaper
                                                    }}
                                                    ModalProps={{
                                                        keepMounted: true
                                                    }}
                                                >
                                                    {drawer}
                                                </Drawer>
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

                                        </SnackbarProvider>
                                    </BreadcrumbsProvider>
                                </SelectedEntityProvider>
                            </Router>
                        </FirebaseConfigContext.Provider>
                    );
                }

                return (
                    <ThemeProvider theme={theme}>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            {firebaseConfigError ?
                                <Box>
                                    It seems like the provided Firebase config
                                    is not correct. If you are using the
                                    credentials provided automatically by
                                    Firebase Hosting, make sure you link your
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
                        </MuiPickersUtilsProvider>
                    </ThemeProvider>
                );
            }

            }
        </AuthContext.Consumer>
    </AuthProvider>;

}

function CMSRouterSwitch({ navigation, additionalViews }: {
    navigation: EntityCollectionView<any>[],
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
                    {additionalView.view}
                </Route>
            ))}

            <Redirect exact from="/"
                      to={firstCollectionPath}/>
        </Switch>
    );
}

