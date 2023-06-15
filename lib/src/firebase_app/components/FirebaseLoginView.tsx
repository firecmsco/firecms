import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { Button, CircularProgress, Fade, Grid, IconButton, Slide, TextField } from "@mui/material";

import { FirebaseApp, FirebaseError } from "firebase/app";
import { ErrorView, FireCMSLogo } from "../../core";
import { useModeController } from "../../hooks";
import { FirebaseAuthController, FirebaseSignInOption, FirebaseSignInProvider } from "../types/auth";
import { appleIcon, facebookIcon, githubIcon, googleIcon, microsoftIcon, twitterIcon } from "./social_icons";
import EmailIcon from "@mui/icons-material/Email";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Phone } from "@mui/icons-material";
import { RECAPTCHA_CONTAINER_ID, useRecaptcha } from "../hooks/useRecaptcha";
import {
    getAuth,
    getMultiFactorResolver,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
    RecaptchaVerifier
} from "firebase/auth";
import TTypography from "../../components/TTypography";

/**
 * @category Firebase
 */
export interface FirebaseLoginViewProps {

    /**
     * Firebase app this login view is accessing
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
    noUserComponent?: ReactNode;

    /**
     * Display this component bellow the sign-in buttons.
     * Useful for adding checkboxes for privacy and terms and conditions.
     * You may want to use it in conjunction with the `disabled` prop.
     */
    additionalComponent?: ReactNode;

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
                                      noUserComponent,
                                      disableSignupScreen = false,
                                      disabled = false,
                                      additionalComponent,
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

    const sendMFASms = useCallback(() => {
        const auth = getAuth();
        const recaptchaVerifier = new RecaptchaVerifier("recaptcha", { size: "invisible" }, auth);

        const resolver = getMultiFactorResolver(auth, authController.authProviderError);

        if (resolver.hints[0].factorId === PhoneMultiFactorGenerator.FACTOR_ID) {

            const phoneInfoOptions = {
                multiFactorHint: resolver.hints[0],
                session: resolver.session
            };
            const phoneAuthProvider = new PhoneAuthProvider(auth);
            // Send SMS verification code
            phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, recaptchaVerifier)
                .then(function (verificationId) {

                    // Ask user for the SMS verification code. Then:
                    const verificationCode = String(window.prompt("Please enter the verification " + "code that was sent to your mobile device."));
                    const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
                    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
                    // // Complete sign-in.
                    return resolver.resolveSignIn(multiFactorAssertion);

                })

        } else {
            // Unsupported second factor.
            console.warn("Unsupported second factor.");
        }

    }, [authController.authProviderError]);

    function buildErrorView() {
        let errorView: any;
        if (authController.user != null) return errorView; // if the user is logged in via MFA
        const ignoredCodes = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];
        if (authController.authProviderError) {
            if (authController.authProviderError.code === "auth/operation-not-allowed" ||
                authController.authProviderError.code === "auth/configuration-not-found") {
                errorView =
                    <div>
                        <div className="p-4">
                            <ErrorView
                                error={"You need to enable Firebase auth and the corresponding login provider in your Firebase project"}/>
                        </div>
                        {firebaseApp &&
                            <div className="p-4">
                                <a href={`https://console.firebase.google.com/project/${firebaseApp.options.projectId}/authentication/providers`}
                                   rel="noopener noreferrer"
                                   target="_blank">
                                    <Button variant="text"
                                            color="primary">
                                        Open Firebase configuration
                                    </Button>
                                </a>
                            </div>}
                    </div>;
            } else if (authController.authProviderError.code === "auth/invalid-api-key") {
                errorView =
                    <div>
                        <div className="p-4">
                            <ErrorView
                                title={"Invalid API key"}
                                error={"auth/invalid-api-key: Check that your Firebase config is set correctly in your `firebase-config.ts` file"}/>
                        </div>
                    </div>;
            } else if (!ignoredCodes.includes(authController.authProviderError.code)) {
                if (authController.authProviderError.code === "auth/multi-factor-auth-required") {
                    sendMFASms();
                }
                errorView =
                    <div className="p-4">
                        <ErrorView error={authController.authProviderError}/>
                    </div>;
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
            timeout={800}
            mountOnEnter
            unmountOnExit>

            <div
                className="flex flex-col items-center justify-center min-h-screen min-w-full p-2">
                <div id="recaptcha"></div>
                <div
                    className="flex flex-col items-center w-full max-w-[480px]">

                    <div className="p-1 w-64 h-64 m-4">
                        {logoComponent}
                    </div>

                    {notAllowedMessage &&
                        <div className="p-8">
                            <ErrorView error={notAllowedMessage}/>
                        </div>}

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
                                onClick={() => setPhoneLoginSelected(true)}/>}

                        {resolvedSignInOptions.includes("anonymous") &&
                            <LoginButton
                                disabled={disabled}
                                text={"Log in anonymously"}
                                icon={<PersonOutlineIcon
                                    fontSize={"large"}/>}
                                onClick={authController.anonymousLogin}/>}

                        {allowSkipLogin &&
                            <div className={"m-4"}>
                                <Button
                                    disabled={disabled}
                                    onClick={authController.skipLogin}>
                                    Skip login
                                </Button>
                            </div>
                        }

                    </>}

                    {passwordLoginSelected && <LoginForm
                        authController={authController}
                        onClose={() => setPasswordLoginSelected(false)}
                        mode={modeState.mode}
                        noUserComponent={noUserComponent}
                        disableSignupScreen={disableSignupScreen}
                    />}

                    {phoneLoginSelected && <PhoneLoginForm
                        authController={authController}
                        onClose={() => setPhoneLoginSelected(false)}
                    />}

                    {!passwordLoginSelected && !phoneLoginSelected && additionalComponent}

                </div>
            </div>
        </Fade>
    );
}

export function LoginButton({
                                icon,
                                onClick,
                                text,
                                disabled
                            }: {
    icon: React.ReactNode,
    onClick: () => void,
    text: string,
    disabled?: boolean
}) {
    return (
        <div className="m-2 w-full">
            <Button fullWidth
                    variant="outlined"
                    disabled={disabled}
                    onClick={onClick}>
                <div
                    className="p-1 flex w-48 h-8 items-center justify-items-center">
                    <div
                        className="flex flex-col w-8 items-center justify-items-center">
                        {icon}
                    </div>
                    <div className="flex-grow pl-2 text-center">{text}</div>
                </div>
            </Button>
        </div>
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
                <div className="p-8">
                    <ErrorView error={"Invalid confirmation code"}/>
                </div>}

            <div id={RECAPTCHA_CONTAINER_ID}/>

            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <IconButton
                        onClick={onClose}>
                        <ArrowBackIcon className="w-5 h-5"/>
                    </IconButton>
                </Grid>
                <Grid item xs={12} className="p-1 flex">
                    <TTypography align={"center"}
                                 variant={"subtitle2"}>{"Please enter your phone number"}</TTypography>
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
                        <Grid item xs={12} className="mt-2 p-1 flex">
                            <TTypography align={"center"}
                                         variant={"subtitle2"}>{"Please enter the confirmation code"}</TTypography>
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
                    <div className="flex justify-end items-center w-full">

                        {authController.authLoading &&
                            <CircularProgress className="p-1" size={16}
                                              thickness={8}/>
                        }

                        <Button type="submit">
                            {"Ok"}
                        </Button>
                    </div>
                </Grid>

            </Grid>
        </form>
    );
}

function LoginForm({
                       onClose,
                       authController,
                       mode,
                       noUserComponent,
                       disableSignupScreen
                   }: {
    onClose: () => void,
    authController: FirebaseAuthController,
    mode: "light" | "dark",
    noUserComponent?: ReactNode,
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
                        <ArrowBackIcon className="w-5 h-5"/>
                    </IconButton>
                </Grid>

                <Grid item xs={12} className="p-1">
                    <TTypography align={"center"} variant={"subtitle2"}>
                        You already have an account
                    </TTypography>
                    <TTypography align={"center"} variant={"body2"}>
                        You can use one of these
                        methods to login with {email}
                    </TTypography>
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
                            <ArrowBackIcon className="w-5 h-5"/>
                        </IconButton>
                    </Grid>

                    <Grid item xs={12}
                          className={`p-4 ${registrationMode && disableSignupScreen ? 'hidden' : 'flex'}`}>
                        <TTypography align={"center"}
                                     variant={"subtitle2"}>{label}</TTypography>
                    </Grid>

                    <Grid item xs={12}
                          className={`${
                              shouldShowEmail ? "block" : "hidden"
                          }`}>
                        <TextField placeholder="Email" fullWidth autoFocus
                                   value={email ?? ""}
                                   disabled={authController.authLoading}
                                   type="email"
                                   onChange={(event) => setEmail(event.target.value)}/>
                    </Grid>

                    <Grid item xs={12}>
                        {registrationMode && noUserComponent}
                    </Grid>

                    <Grid item xs={12}
                          className={`${loginMode || (registrationMode && !disableSignupScreen) ? 'block' : 'hidden'}`}>
                        <TextField placeholder="Password" fullWidth
                                   value={password ?? ""}
                                   disabled={authController.authLoading}
                                   inputRef={passwordRef}
                                   type="password"
                                   onChange={(event) => setPassword(event.target.value)}/>
                    </Grid>

                    <Grid item xs={12}>
                        <div className={`${
                            registrationMode && disableSignupScreen ? "hidden" : "flex"
                        } justify-end items-center w-full`}>

                            {authController.authLoading &&
                                <CircularProgress className="p-1" size={16}
                                                  thickness={8}/>
                            }

                            <Button type="submit">
                                {button}
                            </Button>
                        </div>
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
