import React, { ReactNode, useEffect, useRef, useState } from "react";

import {
    Box,
    Button,
    CircularProgress,
    Fade,
    Grid,
    IconButton,
    Slide,
    TextField,
    Typography
} from "@mui/material";

import { FirebaseApp, FirebaseError } from "firebase/app";
import { ErrorView, FireCMSLogo } from "../../core";
import { useAuthController, useModeController } from "../../hooks";
import {
    FirebaseAuthController,
    FirebaseSignInOption,
    FirebaseSignInProvider
} from "../types/auth";
import {
    appleIcon,
    facebookIcon,
    githubIcon,
    googleIcon,
    microsoftIcon,
    twitterIcon
} from "./social_icons";
import EmailIcon from "@mui/icons-material/Email";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Phone } from "@mui/icons-material";
import { RECAPTCHA_CONTAINER_ID, useRecaptcha } from "../hooks/useRecaptcha";

/**
 * @category Firebase
 */
export interface FirebaseLoginViewProps {

    /**
     * Firebase app this login view is accesing
     */
    firebaseApp: FirebaseApp;

    /**
     * Delegate holding the auth state
     */
    authController: FirebaseAuthController;

    /**
     * Path to the logo displayed in the login screen
     */
    logo?: string;

    /**
     * Enable the skip login button
     */
    allowSkipLogin?: boolean;

    /**
     * Each of the sign in options that get a custom button
     */
    signInOptions: Array<FirebaseSignInProvider | FirebaseSignInOption>;

    /**
     * Disable the login buttons
     */
    disabled?: boolean;

    /**
     * Prevent users from creating new users in when the `signInOptions` value
     * is `password`. This does not apply to the rest of login providers.
     */
    disableSignupScreen?: boolean;

    /**
     * Display this component when no user is found a user tries to log in
     * when the `signInOptions` value is `password`.
     */
    NoUserComponent?: ReactNode;

    /**
     * Display this component bellow the sign-in buttons.
     * Useful for adding checkboxes for privacy and terms and conditions.
     * You may want to use it in conjunction with the `disabled` prop.
     */
    AdditionalComponent?: ReactNode;

    notAllowedError?: any;

}

/**
 * Use this component to render a login view, that updates
 * the state of the {@link FirebaseAuthController} based on the result
 * @constructor
 * @category Firebase
 */
export function FirebaseLoginView({
                                      allowSkipLogin,
                                      logo,
                                      signInOptions,
                                      firebaseApp,
                                      authController,
                                      NoUserComponent,
                                      disableSignupScreen = false,
                                      disabled = false,
                                      AdditionalComponent,
                                      notAllowedError
                                  }: FirebaseLoginViewProps) {

    const modeState = useModeController();

    const [passwordLoginSelected, setPasswordLoginSelected] = useState(false);

    const [phoneLoginSelected, setPhoneLoginSelected] = useState(false);

    const resolvedSignInOptions: FirebaseSignInProvider[] = signInOptions.map((o) => {
        if (typeof o === "object") {
            return o.provider;
        } else return o as FirebaseSignInProvider;
    })

    function buildErrorView() {
        let errorView: any;
        const ignoredCodes = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];
        if (authController.authError) {
            if (authController.authError.code === "auth/operation-not-allowed") {
                errorView =
                    <div>
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
                    </div>;
            } else if (!ignoredCodes.includes(authController.authError.code)) {
                console.error(authController.authError);
                errorView =
                    <Box p={1}>
                        <ErrorView error={authController.authError.message}/>
                    </Box>;
            }
        }
        return errorView;
    }

    let logoComponent;
    if (logo) {
        logoComponent = <img src={logo}
                             style={{
                                 height: "100%",
                                 width: "100%",
                                 objectFit: "cover"
                             }}
                             alt={"Logo"}/>;
    } else {
        logoComponent = <FireCMSLogo/>;
    }

    let notAllowedMessage: string | undefined;
    if (notAllowedError) {
        if (typeof notAllowedError === "string") {
            notAllowedMessage = notAllowedError;
        } else if (notAllowedError instanceof Error) {
            notAllowedMessage = notAllowedError.message;
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
                    maxWidth: 380
                }}>

                    <Box m={1} sx={{
                        padding: 1,
                        width: 260,
                        height: 260
                    }}>
                        {logoComponent}
                    </Box>

                    {notAllowedMessage &&
                        <Box p={2}>
                            <ErrorView
                                error={notAllowedMessage}/>
                        </Box>}

                    {buildErrorView()}

                    {(!passwordLoginSelected && !phoneLoginSelected) && <>

                        {buildOauthLoginButtons(authController, resolvedSignInOptions, modeState.mode, disabled)}

                        {resolvedSignInOptions.includes("password") &&
                            <LoginButton
                                disabled={disabled}
                                text={"Email/password"}
                                icon={<EmailIcon fontSize={"large"}/>}
                                onClick={() => setPasswordLoginSelected(true)}/>}

                        {resolvedSignInOptions.includes("phone") &&
                            <LoginButton
                                disabled={disabled}
                                text={"Phone number"}
                                icon={<Phone fontSize={"large"}/>}
                                onClick={() => setPhoneLoginSelected(true) }/>}

                        {resolvedSignInOptions.includes("anonymous") &&
                            <LoginButton
                                disabled={disabled}
                                text={"Log in anonymously"}
                                icon={<PersonOutlineIcon fontSize={"large"}/>}
                                onClick={authController.anonymousLogin}/>}

                        {allowSkipLogin &&
                            <Box m={1}>
                                <Button
                                    disabled={disabled}
                                    onClick={authController.skipLogin}>
                                    Skip login
                                </Button>
                            </Box>
                        }

                    </>}

                    {passwordLoginSelected && <LoginForm
                        authController={authController}
                        onClose={() => setPasswordLoginSelected(false)}
                        mode={modeState.mode}
                        NoUserComponent={NoUserComponent}
                        disableSignupScreen={disableSignupScreen}
                    />}

                    {phoneLoginSelected && <PhoneLoginForm
                        authController={authController}
                        onClose={() => setPhoneLoginSelected(false)}
                    />}

                    {!passwordLoginSelected && !phoneLoginSelected && AdditionalComponent}

                </Box>
            </Box>
        </Fade>
    );
}

export function LoginButton({
                         icon,
                         onClick,
                         text,
                         disabled
                     }: { icon: React.ReactNode, onClick: () => void, text: string, disabled?: boolean }) {
    return (
        <Box m={0.5} width={"100%"}>
            <Button fullWidth
                    variant="outlined"
                    disabled={disabled}
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

function PhoneLoginForm({
                       onClose,
                       authController
                   }: {
    onClose: () => void,
    authController: FirebaseAuthController,
}) {
    useRecaptcha();

    const [phone, setPhone] = useState<string>();
    const [code, setCode] = useState<string>();
    const [isInvalidCode, setIsInvalidCode] = useState(false);

    const handleSubmit = async (event: any) => {
        event.preventDefault();

        if (code && authController.confirmationResult) {
            setIsInvalidCode(false);

            authController.confirmationResult.confirm(code).catch((e: FirebaseError) => {
                if (e.code === "auth/invalid-verification-code") {
                    setIsInvalidCode(true)
                }
            });
        } else {
            if (phone) {
                authController.phoneLogin(phone, window.recaptchaVerifier);
            }
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {isInvalidCode &&
                <Box p={2}>
                    <ErrorView
                        error={"Invalid confirmation code"}/>
                </Box>}

            <div id={RECAPTCHA_CONTAINER_ID}/>

            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <IconButton
                        onClick={onClose}>
                        <ArrowBackIcon sx={{ width: 20, height: 20 }}/>
                    </IconButton>
                </Grid>
                <Grid item xs={12} sx={{
                    p: 1,
                    display: "flex"
                }}>
                    <Typography align={"center"}
                                variant={"subtitle2"}>{"Please enter your phone number"}</Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField placeholder="" fullWidth
                               value={phone}
                               disabled={Boolean(phone && (authController.authLoading || authController.confirmationResult))}
                               type="phone"
                               required
                               onChange={(event) => setPhone(event.target.value)}/>
                </Grid>
                {Boolean(phone && authController.confirmationResult) &&
                    <>
                        <Grid item xs={12} sx={{
                            mt: 2,
                            p: 1,
                            display: "flex"
                        }}>
                            <Typography align={"center"}
                                        variant={"subtitle2"}>{"Please enter the confirmation code"}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField placeholder="" fullWidth
                                       value={code}
                                       type="text"
                                       required
                                       onChange={(event) => setCode(event.target.value)}/>
                        </Grid>
                    </>
                }

                <Grid item xs={12}>
                    <Box sx={{
                        display: "flex",
                        justifyContent: "end",
                        alignItems: "center",
                        width: "100%"
                    }}>

                        {authController.authLoading &&
                            <CircularProgress sx={{ p: 1 }} size={16}
                                              thickness={8}/>
                        }

                        <Button type="submit">
                            {"Ok"}
                        </Button>
                    </Box>
                </Grid>

            </Grid>
        </form>
    );
}

function LoginForm({
                       onClose,
                       authController,
                       mode,
                       NoUserComponent,
                       disableSignupScreen
                   }: {
    onClose: () => void,
    authController: FirebaseAuthController,
    mode: "light" | "dark",
    NoUserComponent?: ReactNode,
    disableSignupScreen: boolean
}) {

    const passwordRef = useRef<HTMLInputElement | null>(null);

    const [email, setEmail] = useState<string>();
    const [availableProviders, setAvailableProviders] = useState<string[] | undefined>();
    const [password, setPassword] = useState<string>();

    const shouldShowEmail = availableProviders === undefined;
    const loginMode = availableProviders && availableProviders.includes("password");
    const otherProvidersMode = availableProviders && !availableProviders.includes("password") && availableProviders.length > 0;
    const registrationMode = availableProviders && !availableProviders.includes("password");

    useEffect(() => {
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
    }, [onClose]);

    function handleEnterEmail() {
        if (email) {
            authController.fetchSignInMethodsForEmail(email).then((availableProviders) => {
                setAvailableProviders(availableProviders)
            });
        }
    }

    function handleEnterPassword() {
        if (email && password) {
            authController.emailPasswordLogin(email, password);
        }
    }

    function handleRegistration() {
        if (email && password) {
            authController.createUserWithEmailAndPassword(email, password);
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
                    {availableProviders && buildOauthLoginButtons(authController, availableProviders, mode, false)}
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

                    <Grid item xs={12} sx={{
                        p: 1,
                        display: (registrationMode && disableSignupScreen) ? "none" : "flex"
                    }}>
                        <Typography align={"center"}
                                    variant={"subtitle2"}>{label}</Typography>
                    </Grid>

                    <Grid item xs={12}
                          sx={{ display: shouldShowEmail ? "inherit" : "none" }}>
                        <TextField placeholder="Email" fullWidth autoFocus
                                   value={email ?? ""}
                                   disabled={authController.authLoading}
                                   type="email"
                                   onChange={(event) => setEmail(event.target.value)}/>
                    </Grid>

                    <Grid item xs={12}>
                        {registrationMode && NoUserComponent}
                    </Grid>

                    <Grid item xs={12}
                          sx={{ display: loginMode || (registrationMode && !disableSignupScreen) ? "inherit" : "none" }}>
                        <TextField placeholder="Password" fullWidth
                                   value={password ?? ""}
                                   disabled={authController.authLoading}
                                   inputRef={passwordRef}
                                   type="password"
                                   onChange={(event) => setPassword(event.target.value)}/>
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{
                            display: (registrationMode && disableSignupScreen) ? "none" : "flex",
                            justifyContent: "end",
                            alignItems: "center",
                            width: "100%"
                        }}>

                            {authController.authLoading &&
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

function buildOauthLoginButtons(authController: FirebaseAuthController, providers: string[], mode: "light" | "dark", disabled: boolean) {
    return <>
        {providers.includes("google.com") && <LoginButton
            disabled={disabled}
            text={"Sign in with Google"}
            icon={googleIcon(mode)}
            onClick={authController.googleLogin}/>}

        {providers.includes("microsoft.com") && <LoginButton
            disabled={disabled}
            text={"Sign in with Microsoft"}
            icon={microsoftIcon(mode)}
            onClick={authController.microsoftLogin}/>}

        {providers.includes("apple.com") && <LoginButton
            disabled={disabled}
            text={"Sign in with Apple"}
            icon={appleIcon(mode)}
            onClick={authController.appleLogin}/>}

        {providers.includes("github.com") && <LoginButton
            disabled={disabled}
            text={"Sign in with Github"}
            icon={githubIcon(mode)}
            onClick={authController.githubLogin}/>}

        {providers.includes("facebook.com") && <LoginButton
            disabled={disabled}
            text={"Sign in with Facebook"}
            icon={facebookIcon(mode)}
            onClick={authController.facebookLogin}/>}

        {providers.includes("twitter.com") && <LoginButton
            disabled={disabled}
            text={"Sign in with Twitter"}
            icon={twitterIcon(mode)}
            onClick={authController.twitterLogin}/>}
    </>
}
