import React, { useEffect } from "react";
import {
    AppBar,
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
    Toolbar,
    Typography
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

import 'typeface-roboto';

import { ThemeProvider, useTheme } from "@material-ui/core/styles";
import {
    BrowserRouter as Router,
    Link as ReactLink,
    Redirect,
    Route,
    Switch
} from "react-router-dom";

import * as firebase from "firebase";
import "firebase/auth";

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


/**
 * Main entry point that defines the CMS configuration
 */
interface CMSAppProps {
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
     * Defaults to true.
     * TODO: change for an object defining log in methods and an authenticator to discriminate specific users or domains.
     */
    authentication?: boolean;

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

export const AuthContext = React.createContext<firebase.User | null>(null);

export default function CMSApp({
                                   name,
                                   logo,
                                   navigation,
                                   includeMedia,
                                   authentication,
                                   firebaseConfig,
                                   additionalViews
                               }: CMSAppProps) {
    const classes = useStyles();
    const theme = useTheme();
    const [authLoading, setAuthLoading] = React.useState(true);
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [
        firebaseConfigInitialized,
        setFirebaseConfigInitialized
    ] = React.useState<boolean>(false);
    const [loggedUser, setLoggedUser] = React.useState<firebase.User | null>(null);
    const [authError, setAuthError] = React.useState<any>();
    const [error, setError] = React.useState<string>();

    const authenticationEnabled = authentication === undefined || authentication;

    function initFirebase(config: Object) {
        firebase.initializeApp(config);
        setFirebaseConfigInitialized(true);
        firebase.auth().onAuthStateChanged(
            user => {
                setAuthLoading(false);
                setLoggedUser(user);
            },
            error => setAuthError(error)
        );
    }

    useEffect(() => {
        document.title = name;

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
                    setError(
                        "Could not load Firebase configuration from Firebase hosting. " +
                        "If the app is not deployed in Firebase hosting, you need to specify the configuration manually" +
                        e.toString()
                    )
                );
        } else if (firebaseConfig) {
            initFirebase(firebaseConfig);
        } else {
            setError(
                "You need to deploy the app to Firebase hosting or specify a Firebase configuration object"
            );
        }
    }, []);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    function signIn() {
        firebase
            .auth()
            .signInWithPopup(googleAuthProvider)
            .then((_: firebase.auth.UserCredential) => {
            })
            .catch(error => setAuthError(error));
    }

    function onSignOut() {
        firebase.auth().signOut();
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
                <Grid item xs={12}>
                    <Button onClick={signIn}>Sign in</Button>
                </Grid>
                <Grid item xs={12}>
                    {/* TODO: add link to https://console.firebase.google.com/u/0/project/[PROYECT_ID]/authentication/providers in order to enable google */}
                    {/* in case the error code is auth/operation-not-allowed */}
                    {authError && <div>{authError.code}</div>}
                    {authError && <div>{authError.message}</div>}
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
        if (error) {
            return <Box> {error} </Box>;
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
                            <ListItemText primary={view.name} primaryTypographyProps={{variant:"subtitle2"}}/>
                        </ListItem>
                    ))}

                    {shouldIncludeMedia && (
                        <React.Fragment>
                            <Divider/>
                            <ListItem button component={ReactLink} to="/media">
                                <ListItemText primary="Media"/>
                            </ListItem>
                        </React.Fragment>
                    )}

                    {additionalViews && (
                        <React.Fragment>
                            {additionalViews.map(additionalView => (
                                <ListItem
                                    button
                                    key={`additional-view-${additionalView.path}`}
                                    component={ReactLink}
                                    to={addInitialSlash(additionalView.path)}
                                >
                                    <ListItemText
                                        primary={additionalView.name}/>
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
                        <AppBar position="fixed" className={classes.appBar}>
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
                                <Button variant="text" color="inherit"
                                        onClick={onSignOut}>
                                    Log Out
                                </Button>
                            </Toolbar>
                        </AppBar>
                        <nav className={classes.drawer}>
                            {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
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
                {authLoading ? (
                    <CircularProgressCenter/>
                ) : (!authenticationEnabled || loggedUser) ? (
                    renderMainView()
                ) : (
                    renderLoginView()
                )}
            </MuiPickersUtilsProvider>
        </ThemeProvider>
    );
}
