import React, { useEffect, useRef, useState } from "react";

import {
    Box,
    Button,
    CircularProgress,
    Fade,
    Grid,
    IconButton,
    Slide,
    TextField,
    Theme,
    Typography
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

import { FirebaseApp } from "firebase/app";
import { FireCMSLogo } from "../../core/components/FireCMSLogo";
import { useAuthController, useModeState } from "../../hooks";
import {
    FirebaseAuthDelegate,
    FirebaseSignInOption,
    FirebaseSignInProvider
} from "../models/auth";
import {
    appleIcon,
    facebookIcon,
    githubIcon,
    googleIcon,
    microsoftIcon,
    twitterIcon
} from "./social_icons";
import { ErrorView } from "../../core";
import EmailIcon from "@mui/icons-material/Email";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        logo: {
            padding: theme.spacing(3),
            width: 260,
            height: 260
        }
    })
);

/**
 * @category Firebase
 */
export interface FirebaseLoginViewProps {
    skipLoginButtonEnabled?: boolean,
    logo?: string,
    signInOptions: Array<FirebaseSignInProvider | FirebaseSignInOption>;
    firebaseApp: FirebaseApp;
    authDelegate: FirebaseAuthDelegate
}

/**
 * Use this component to render a login view, that updates
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
    const modeState = useModeState();

    const [passwordLoginSelected, setPasswordLoginSelected] = useState(false);

    const resolvedSignInOptions: FirebaseSignInProvider[] = signInOptions.map((o) => {
        if (typeof o === "object") {
            return o.provider;
        } else return o as FirebaseSignInProvider;
    })

    function buildErrorView() {
        let errorView: any;
        const ignoredCodes = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];
        if (authDelegate.authError) {
            if (authDelegate.authError.code === "auth/operation-not-allowed") {
                errorView =
                    <>
                        <Box p={1}>
                            <ErrorView
                                error={"You need to enable the corresponding login provider in your Firebase project"}/>
                        </Box>

                        {firebaseApp &&
                        <Box p={1}>
                            <a href={`https://console.firebase.google.com/project/${firebaseApp.options.projectId}/authentication/providers`}
                               rel="noopener noreferrer"
                               target="_blank">
                                <Button variant="text"
                                        color="primary">
                                    Open Firebase configuration
                                </Button>
                            </a>
                        </Box>}
                    </>;
            } else if (!ignoredCodes.includes(authDelegate.authError.code)) {
                console.error(authDelegate.authError);
                errorView =
                    <Box p={1}>
                        <ErrorView error={authDelegate.authError.message}/>
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
        } else if (authController.notAllowedError instanceof Error) {
            notAllowedMessage = authController.notAllowedError.message;
        } else {
            notAllowedMessage = "It looks like you don't have access to the CMS, based on the specified Authenticator configuration";
        }
    }


    return (
        <Fade
            in={true}
            timeout={500}
            mountOnEnter
            unmountOnExit>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                p: 2
            }}>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    width: "100%",
                    maxWidth: 340
                }}>

                    <Box m={1}>
                        {logoComponent}
                    </Box>

                    {notAllowedMessage &&
                    <Box p={2}>
                        <ErrorView
                            closeFn={authController.clearNotAllowedError}
                            error={notAllowedMessage}/>
                    </Box>}

                    {buildErrorView()}

                    {!passwordLoginSelected && <>

                        {buildOauthLoginButtons(authDelegate, resolvedSignInOptions, modeState.mode)}

                        {resolvedSignInOptions.includes("password") &&
                        <LoginButton
                            text={"Email/password"}
                            icon={<EmailIcon fontSize={"large"}/>}
                            onClick={() => setPasswordLoginSelected(true)}/>}


                        {resolvedSignInOptions.includes("anonymous") &&
                        <LoginButton
                            text={"Log in anonymously"}
                            icon={<PersonOutlineIcon fontSize={"large"}/>}
                            onClick={authDelegate.anonymousLogin}/>}

                        {skipLoginButtonEnabled &&
                        <Box m={1}>
                            <Button onClick={authDelegate.skipLogin}>
                                Skip login
                            </Button>
                        </Box>
                        }

                    </>}

                    {passwordLoginSelected && <LoginForm
                        authDelegate={authDelegate}
                        onClose={() => setPasswordLoginSelected(false)}
                        mode={modeState.mode}/>}

                </Box>
            </Box>
        </Fade>
    );
}

function LoginButton({
                         icon,
                         onClick,
                         text
                     }: { icon: React.ReactNode, onClick: () => void, text: string }) {
    return (
        <Box m={0.5} width={"100%"}>
            <Button fullWidth
                    variant="outlined"
                    onClick={onClick}>
                <Box sx={{
                    p: "1",
                    display: "flex",
                    width: "240px",
                    height: "32px",
                    alignItems: "center",
                    justifyItems: "center"
                }}>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "32px",
                        alignItems: "center",
                        justifyItems: "center"
                    }}>
                        {icon}
                    </Box>
                    <Box sx={{
                        flexGrow: 1,
                        pl: 2,
                        textAlign: "center"
                    }}>{text}</Box>
                </Box>
            </Button>
        </Box>
    )
}

function LoginForm({
                       onClose,
                       authDelegate,
                       mode
                   }: { onClose: () => void, authDelegate: FirebaseAuthDelegate, mode: "light" | "dark" }) {

    const passwordRef = useRef<HTMLInputElement | null>(null);

    const [email, setEmail] = useState<string>();
    const [availableProviders, setAvailableProviders] = useState<string[] | undefined>();
    const [password, setPassword] = useState<string>();

    const shouldShowEmail = availableProviders === undefined;
    const loginMode = availableProviders && availableProviders.includes("password");
    const otherProvidersMode = availableProviders && !availableProviders.includes("password") && availableProviders.length > 0;
    const registrationMode = availableProviders && !availableProviders.includes("password");

    useEffect(() => {
        console.log("loginMode", loginMode);
        if ((loginMode || registrationMode) && passwordRef.current) {
            passwordRef.current.focus()
        }
    }, [loginMode, registrationMode]);

    useEffect(() => {
        if (!document) return;
        const escFunction = (event: any) => {
            if (event.keyCode === 27) {
                onClose();
            }
        };
        document.addEventListener("keydown", escFunction, false);
        return () => {
            document.removeEventListener("keydown", escFunction, false);
        };
    }, [document]);

    function handleEnterEmail() {
        if (email) {
            authDelegate.fetchSignInMethodsForEmail(email).then(setAvailableProviders);
        }
    }

    function handleEnterPassword() {
        if (email && password) {
            authDelegate.emailPasswordLogin(email, password);
        }
    }

    function handleRegistration() {
        if (email && password) {
            authDelegate.createUserWithEmailAndPassword(email, password);
        }
    }

    const onBackPressed = () => {
        if (shouldShowEmail) {
            onClose();
        } else {
            setAvailableProviders(undefined);
        }
    }

    const handleSubmit = (event: any) => {
        event.preventDefault();
        if (shouldShowEmail) {
            handleEnterEmail();
        } else if (loginMode) {
            handleEnterPassword();
        } else if (registrationMode) {
            handleRegistration();
        }
    }

    const label = registrationMode
? "No user found with that email. Pick a password to create a new account"
        : (loginMode ? "Please enter your password" : "Please enter your email");
    const button = registrationMode ? "Create account" : (loginMode ? "Login" : "Ok");

    if (otherProvidersMode) {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <IconButton
                        onClick={onBackPressed}>
                        <ArrowBackIcon sx={{ width: 20, height: 20 }}/>
                    </IconButton>
                </Grid>

                <Grid item xs={12} sx={{ p: 1 }}>
                    <Typography align={"center"} variant={"subtitle2"}>
                        You already have an account
                    </Typography>
                    <Typography align={"center"} variant={"body2"}>
                        You can use one of these
                        methods to login with {email}
                    </Typography>
                </Grid>

                <Grid item xs={12}>
                    {availableProviders && buildOauthLoginButtons(authDelegate, availableProviders, mode)}
                </Grid>
            </Grid>
        );
    }

    return (
        <Slide
            direction="up"
            in={true}
            mountOnEnter
            unmountOnExit>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <IconButton
                            onClick={onBackPressed}>
                            <ArrowBackIcon sx={{ width: 20, height: 20 }}/>
                        </IconButton>
                    </Grid>

                    <Grid item xs={12} sx={{ p: 1 }}>
                        <Typography align={"center"}
                                    variant={"subtitle2"}>{label}</Typography>
                    </Grid>

                    <Grid item xs={12}
                          sx={{ display: shouldShowEmail ? "inherit" : "none" }}>
                        <TextField placeholder="Email" fullWidth autoFocus
                                   value={email}
                                   disabled={authDelegate.authLoading}
                                   type="email"
                                   onChange={(event) => setEmail(event.target.value)}/>
                    </Grid>

                    <Grid item xs={12}
                          sx={{ display: loginMode || registrationMode ? "inherit" : "none" }}>
                        <TextField placeholder="Password" fullWidth
                                   value={password}
                                   disabled={authDelegate.authLoading}
                                   inputRef={passwordRef}
                                   type="password"
                                   onChange={(event) => setPassword(event.target.value)}/>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "end",
                            alignItems: "center",
                            width: "100%"
                        }}>

                            {authDelegate.authLoading &&
                            <CircularProgress sx={{ p: 1 }} size={16}
                                              thickness={8}/>
                            }

                            <Button type="submit">
                                {button}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Slide>
    );

}

function buildOauthLoginButtons(authDelegate: FirebaseAuthDelegate, providers: string[], mode: "light" | "dark") {
    return <>
        {providers.includes("google.com") && <LoginButton
            text={"Sign in with Google"}
            icon={googleIcon(mode)}
            onClick={authDelegate.googleLogin}/>}

        {providers.includes("microsoft.com") && <LoginButton
            text={"Sign in with Microsoft"}
            icon={microsoftIcon(mode)}
            onClick={authDelegate.microsoftLogin}/>}

        {providers.includes("apple.com") && <LoginButton
            text={"Sign in with Apple"}
            icon={appleIcon(mode)}
            onClick={authDelegate.appleLogin}/>}

        {providers.includes("github.com") && <LoginButton
            text={"Sign in with Github"}
            icon={githubIcon(mode)}
            onClick={authDelegate.githubLogin}/>}

        {providers.includes("facebook.com") && <LoginButton
            text={"Sign in with Facebook"}
            icon={facebookIcon(mode)}
            onClick={authDelegate.facebookLogin}/>}

        {providers.includes("twitter.com") && <LoginButton
            text={"Sign in with Twitter"}
            icon={twitterIcon(mode)}
            onClick={authDelegate.twitterLogin}/>}
    </>
}
