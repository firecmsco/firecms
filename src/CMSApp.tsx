import React, { useEffect } from "react";
import {
    AppBar,
    Avatar,
    Box,
    Button,
    CssBaseline,
    Divider,
    Drawer,
    Grid,
    Hidden,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Slide,
    Toolbar,
    Typography,
    useScrollTrigger
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import {
    BrowserRouter as Router,
    Link as ReactLink,
    Redirect,
    Route,
    Switch
} from "react-router-dom";

import * as firebase from "firebase/app";
import { auth, User } from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/storage";
import "firebase/firestore";

import { CircularProgressCenter } from "./util";
import { EntityCollectionView } from "./models";
import {
    addInitialSlash,
    buildDataPath,
    CollectionRoute,
    EntityFormRoute,
    getAllPaths,
    MediaRoute,
    PathConfiguration,
    removeInitialSlash
} from "./routes";
import { useStyles } from "./styles";
import { Authenticator } from "./authenticator";
import { blue, pink, red } from "@material-ui/core/colors";

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
     * Should the CMS include the Media view (WIP, do not use yet)
     */
    includeMedia?: boolean;

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
    view: React.ReactChild;
}


const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

export const AuthContext = React.createContext<User | null>(null);

interface HideOnScrollProps {
    /**
     * Injected by the documentation to work in an iframe.
     * You won't need it on your project.
     */
    window?: () => Window;
    children: React.ReactElement;
}

function HideOnScroll(props: HideOnScrollProps) {
    const { children, window } = props;
    const trigger = useScrollTrigger({
        target: window ? window() : undefined,
        threshold: 100
    });

    return (
        <Slide appear={false} direction="down" in={!trigger}>
            {children}
        </Slide>
    );
}

export function CMSApp({
                                   name,
                                   logo,
                                   navigation,
                                   includeMedia,
                                   authentication,
                                   allowSkipLogin,
                                   firebaseConfig,
                                   additionalViews,
                                   primaryColor,
                                   secondaryColor,
                                   ...props
                               }: CMSAppProps) {
    const classes = useStyles();
    const theme = createMuiTheme({
        palette: {
            background: {
                default: "#f1f1f1"
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
        shape: {
            borderRadius: 2
        },
        overrides: {
            MuiTableRow: {
                root: {
                    "&:last-child td": {
                        borderBottom: 0,
                    },
                }
            }
        },
    });


    const [mobileOpen, setMobileOpen] = React.useState(false);

    const [
        firebaseConfigInitialized,
        setFirebaseConfigInitialized
    ] = React.useState<boolean>(false);
    const [configError, setConfigError] = React.useState<string>();

    const [authLoading, setAuthLoading] = React.useState(true);
    const [loggedUser, setLoggedUser] = React.useState<User | null>(null);
    const [loginSkipped, setLoginSkipped] = React.useState<boolean>(false);
    const [authProviderError, setAuthProviderError] = React.useState<any>();
    const [notAllowedError, setNotAllowedError] = React.useState<boolean>(false);
    const [firebaseConfigError, setFirebaseConfigError] = React.useState<boolean>(false);

    const authenticationEnabled = authentication === undefined || !!authentication;
    const skipLoginButtonEnabled = authenticationEnabled && allowSkipLogin;

    const authenticator: Authenticator | undefined
        = authentication instanceof Function ? authentication : undefined;

    const onAuthStateChanged = async (user: User | null) => {

        setNotAllowedError(false);

        if (authenticator && user) {
            const allowed = await authenticator(user);
            if (allowed)
                setLoggedUser(user);
            else
                setNotAllowedError(true);
        } else {
            setLoggedUser(user);
        }

        setAuthLoading(false);
    };

    function initFirebase(config: Object) {
        try {
            firebase.initializeApp(config);
            firebase.analytics();
            firebase.auth().onAuthStateChanged(
                onAuthStateChanged,
                error => setAuthProviderError(error)
            );
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
                    console.log("Firebase init response", response);
                    if (response && response.status < 300) {
                        const config = await response.json();
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

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    function googleSignIn() {
        setAuthProviderError(null);
        firebase
            .auth()
            .signInWithPopup(googleAuthProvider)
            .then((_: auth.UserCredential) => {
            })
            .catch(error => setAuthProviderError(error));
    }

    function skipLogin() {
        setAuthProviderError(null);
        setLoginSkipped(true);
    }

    function onSignOut() {
        firebase.auth().signOut();
        setLoginSkipped(false);
    }

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
                <Box className={classes.toolbar}>
                    {logo && <img className={classes.logo} src={logo}/>}
                </Box>

                <Grid item xs={12}>
                    <Button variant="contained"
                            color="primary"
                            onClick={googleSignIn}>
                        Google login
                    </Button>
                </Grid>

                {skipLoginButtonEnabled && <Grid item xs={12}>
                    <Button onClick={skipLogin}>Skip login</Button>
                </Grid>}

                <Grid item xs={12}>

                    {/* TODO: add link to https://console.firebase.google.com/u/0/project/[PROYECT_ID]/authentication/providers in order to enable google */}
                    {/* in case the error code is auth/operation-not-allowed */}

                    {notAllowedError &&
                    <Box p={2}>It looks like you don't have access to the CMS,
                        based
                        on the specified Authenticator configuration</Box>}

                    {/*{authProviderError && <Box>{authProviderError.code}</div>}*/}
                    {authProviderError &&
                    <Box p={2}>{authProviderError.message}</Box>}

                </Grid>
            </Grid>
        );
    }

    function getRouterSwitch(shouldIncludeMedia: boolean) {

        const allPaths = getAllPaths(navigation);

        const firstCollectionPath = removeInitialSlash(navigation[0].relativePath);

        return (
            <Switch>
                {allPaths
                    .map(
                        ({
                             entries,
                             entityPlaceholderPath,
                             breadcrumbs,
                             view
                         }: PathConfiguration) =>
                            entries.map(entry => (
                                <Route
                                    path={buildDataPath(entry.fullPath)}
                                    key={`navigation_${entry.routeType}_${entry.placeHolderId}`}
                                    render={props => {
                                        if (entry.routeType === "entity")
                                            return (
                                                <EntityFormRoute
                                                    {...props}
                                                    view={view}
                                                    breadcrumbs={breadcrumbs}
                                                    entityPlaceholderPath={entityPlaceholderPath}
                                                />
                                            );
                                        else if (entry.routeType === "collection")
                                            return (
                                                <CollectionRoute
                                                    {...props}
                                                    view={view}
                                                    breadcrumbs={breadcrumbs}
                                                    entityPlaceholderPath={entityPlaceholderPath}
                                                />
                                            );
                                        else throw Error("No know routeType");
                                    }}
                                />
                            ))
                    )
                    .flat()}

                {shouldIncludeMedia && (
                    <Route path="/media">
                        <MediaRoute/>
                    </Route>
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
                          to={buildDataPath(firstCollectionPath)}/>
            </Switch>
        );
    }

    function renderMainView() {
        if (configError) {
            return <Box> {configError} </Box>;
        }

        if (!firebaseConfigInitialized) {
            return <CircularProgressCenter/>;
        }

        const shouldIncludeMedia =
            includeMedia !== undefined && includeMedia;

        const drawer = (
            <React.Fragment>

                <Box className={classes.toolbar}>
                    {logo && <img className={classes.logo} src={logo}/>}
                </Box>

                <Divider/>
                <List>
                    {Object.entries(navigation).map(([key, view], index) => (
                        <ListItem
                            button
                            key={`navigation_${index}_${key}`}
                            component={ReactLink}
                            to={buildDataPath(view.relativePath)}
                        >
                            <ListItemText
                                primary={view.name.toUpperCase()}
                                primaryTypographyProps={{ variant: "subtitle2" }}/>
                        </ListItem>
                    ))}

                    {shouldIncludeMedia && (
                        <React.Fragment>
                            <Divider/>
                            <ListItem button component={ReactLink} to="/media">
                                <ListItemText
                                    primary="Media"
                                    primaryTypographyProps={{ variant: "subtitle2" }}/>
                            </ListItem>
                        </React.Fragment>
                    )}

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
            </React.Fragment>
        );

        return (
            <AuthContext.Provider value={loggedUser}>
                <Router>
                    <Box className={classes.root}>
                        <CssBaseline/>
                        <AppBar className={classes.appBar}>
                            <Toolbar>
                                <IconButton
                                    color="inherit"
                                    aria-label="open drawer"
                                    edge="start"
                                    onClick={handleDrawerToggle}
                                    className={classes.menuButton}
                                >
                                    <MenuIcon/>
                                </IconButton>
                                <Typography variant="h6" noWrap>
                                    {name}
                                </Typography>
                                <Box className={classes.grow}/>

                                <Box p={2}>
                                    {loggedUser && loggedUser.photoURL ?
                                        <Avatar src={loggedUser.photoURL}/>
                                        :
                                        <Avatar>{loggedUser?.displayName ? loggedUser.displayName[0] : "A"}</Avatar>
                                    }
                                </Box>

                                <Button variant="text" color="inherit"
                                        onClick={onSignOut}>
                                    Log Out
                                </Button>

                            </Toolbar>
                        </AppBar>

                        <nav className={classes.drawer}>
                            <Hidden mdUp implementation="css">
                                <Drawer
                                    variant="temporary"
                                    anchor={theme.direction === "rtl" ? "right" : "left"}
                                    open={mobileOpen}
                                    onClose={handleDrawerToggle}
                                    classes={{
                                        paper: classes.drawerPaper
                                    }}
                                    ModalProps={{
                                        keepMounted: true // Better open performance on mobile.
                                    }}
                                >
                                    {drawer}
                                </Drawer>
                            </Hidden>
                            <Hidden smDown implementation="css">
                                <Drawer
                                    classes={{
                                        paper: classes.drawerPaper
                                    }}
                                    variant="permanent"
                                    open
                                >
                                    {drawer}
                                </Drawer>
                            </Hidden>
                        </nav>
                        <main className={classes.content}>
                            <Box className={classes.toolbar}/>
                            {getRouterSwitch(shouldIncludeMedia)}
                        </main>
                    </Box>
                </Router>
            </AuthContext.Provider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                {firebaseConfigError ?
                    <Box>
                        It seems like the provided Firebase config is not
                        correct. If you are using the credentials provided automatically
                        by Firebase Hosting, make sure you your Firebase app to Firebase Hosting.
                    </Box> :
                    (
                        authLoading ? (
                            <CircularProgressCenter/>
                        ) : (!authenticationEnabled || loggedUser || loginSkipped) ? (
                            renderMainView()
                        ) : (
                            renderLoginView()
                        )
                    )}
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    );
}
