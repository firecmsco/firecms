import React, { ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { FirebaseApp, FirebaseError } from "@firebase/app";
import { ErrorView, FireCMSLogo, useModeController, useSnackbarController, } from "@firecms/core";
import {
    ArrowBackIcon,
    Button,
    CallIcon,
    CircularProgress,
    cls,
    IconButton,
    LoadingButton,
    MailIcon,
    PersonIcon,
    TextField,
    Typography,
} from "@firecms/ui";
import { appleIcon, facebookIcon, githubIcon, googleIcon, microsoftIcon, twitterIcon } from "./social_icons";
import {
    getAuth,
    getMultiFactorResolver,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
    RecaptchaVerifier
} from "@firebase/auth";
import {
    FirebaseAuthController,
    FirebaseSignInOption,
    FirebaseSignInProvider,
    RECAPTCHA_CONTAINER_ID,
    useRecaptcha
} from "../index";

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
     * Prevent users from resetting their password when the `signInOptions` value
     * is `password`. This does not apply to the rest of login providers.
     */
    disableResetPassword?: boolean;

    /**
     * Display this component when no user is found a user tries to log in
     * when the `signInOptions` value is `password`.
     */
    noUserComponent?: ReactNode;

    /**
     * Include additional components in the login view, on top of the login buttons.
     */
    children?: ReactNode;

    /**
     * Display this component bellow the sign-in buttons.
     * Useful for adding checkboxes for privacy and terms and conditions.
     * You may want to use it in conjunction with the `disabled` prop.
     */
    additionalComponent?: ReactNode;

    notAllowedError?: any;

    className?: string;

}

/**
 * Use this component to render a login view, that updates
 * the state of the {@link FirebaseAuthController} based on the result

 * @category Firebase
 */
export function FirebaseLoginView({
                                      children,
                                      allowSkipLogin,
                                      logo,
                                      signInOptions,
                                      firebaseApp,
                                      authController,
                                      noUserComponent,
                                      disableSignupScreen = false,
                                      disableResetPassword = false,
                                      disabled = false,
                                      additionalComponent,
                                      notAllowedError,
                                      className
                                  }: FirebaseLoginViewProps) {

    const modeState = useModeController();

    const [passwordLoginSelected, setPasswordLoginSelected] = useState(false);

    const [phoneLoginSelected, setPhoneLoginSelected] = useState(false);

    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        // Trigger the fade-in effect on component mount
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, 50); // Small delay to ensure transition works properly

        return () => clearTimeout(timer);
    }, []);

    const resolvedSignInOptions: FirebaseSignInProvider[] = signInOptions.map((o) => {
        if (typeof o === "object") {
            return o.provider;
        } else return o as FirebaseSignInProvider;
    })

    const sendMFASms = useCallback(() => {
        const auth = getAuth(firebaseApp);
        const recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha", { size: "invisible" });

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
                    <>
                        <div className="p-4">
                            <ErrorView
                                title={"Firebase Auth not enabled"}
                                error={"You need to enable Firebase Auth and the corresponding login provider in your Firebase project"}/>
                        </div>
                        {firebaseApp &&
                            <div className="p-4">
                                <a href={`https://console.firebase.google.com/project/${firebaseApp.options.projectId}/authentication/providers`}
                                   rel="noopener noreferrer"
                                   target="_blank">
                                    <Button variant="text"
                                            color="error">
                                        Open Firebase configuration
                                    </Button>
                                </a>
                            </div>}
                    </>;
            } else if (authController.authProviderError.code === "auth/invalid-api-key") {
                errorView = <div className="p-4">
                    <ErrorView
                        title={"Invalid API key"}
                        error={"auth/invalid-api-key: Check that your Firebase config is set correctly in your `firebase_config.ts` file"}/>
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
                                 objectFit: "contain"
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

    const fadeStyle = {
        opacity: fadeIn ? 1 : 0,
        transition: "opacity 0.6s ease-in-out"
    };

    return (

        <div
            className={cls("flex flex-col items-center justify-center min-w-full p-4", className)}
            style={fadeStyle}>
            <div id="recaptcha"></div>
            <div
                className="flex flex-col items-center w-full max-w-[500px]">

                <div className="p-1 w-64 h-64 m-4">
                    {logoComponent}
                </div>

                {children}

                {notAllowedMessage &&
                    <div className="p-8">
                        <ErrorView error={notAllowedMessage}/>
                    </div>}

                {buildErrorView()}

                {(!passwordLoginSelected && !phoneLoginSelected) && <div className={"my-4 w-full"}>

                    {buildOauthLoginButtons(authController, resolvedSignInOptions, modeState.mode, disabled)}

                    {resolvedSignInOptions.includes("password") &&
                        <LoginButton
                            disabled={disabled}
                            text={"Email/password"}
                            icon={<MailIcon size={28}/>}
                            onClick={() => setPasswordLoginSelected(true)}/>}

                    {resolvedSignInOptions.includes("phone") &&
                        <LoginButton
                            disabled={disabled}
                            text={"Phone number"}
                            icon={<CallIcon size={28}/>}
                            onClick={() => setPhoneLoginSelected(true)}/>}

                    {resolvedSignInOptions.includes("anonymous") &&
                        <LoginButton
                            disabled={disabled}
                            text={"Log in anonymously"}
                            icon={<PersonIcon
                                size={28}/>}
                            onClick={authController.anonymousLogin}/>}

                    {allowSkipLogin &&
                        <Button
                            className={"m-1 mb-4"}
                            variant={"text"}
                            disabled={disabled}
                            onClick={authController.skipLogin}>
                            Skip login
                        </Button>
                    }

                </div>}

                {passwordLoginSelected && <LoginForm
                    authController={authController}
                    onClose={() => setPasswordLoginSelected(false)}
                    mode={modeState.mode}
                    noUserComponent={noUserComponent}
                    disableSignupScreen={disableSignupScreen}
                    disableResetPassword={disableResetPassword}
                />}

                {phoneLoginSelected && <PhoneLoginForm
                    authController={authController}
                    onClose={() => setPhoneLoginSelected(false)}
                />}

                {!passwordLoginSelected && !phoneLoginSelected && additionalComponent}

            </div>
        </div>
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
        <div className="my-1 w-full">
            <Button
                className={cls("w-full bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100", disabled ? "" : "hover:text-surface-800 hover:dark:text-white")}
                style={{
                    height: "40px",
                    borderRadius: "4px",
                    fontSize: "14px"
                }}
                variant="outlined"
                disabled={disabled}
                onClick={onClick}>
                <div
                    className="p-1 flex h-8 items-center justify-items-center">
                    <div
                        className="flex flex-col w-8 items-center justify-items-center mr-4">
                        {icon}
                    </div>
                    <div className="grow pl-2 text-center">{text}</div>
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

            <div className={"flex flex-col gap-1"}>
                <IconButton
                    onClick={onClose}>
                    <ArrowBackIcon className="w-5 h-5"/>
                </IconButton>
                <div className="p-1 flex">
                    <Typography align={"center"}
                                variant={"subtitle2"}>{"Please enter your phone number"}</Typography>
                </div>
                <TextField placeholder=""
                           value={phone ?? ""}
                           disabled={Boolean(phone && (authController.authLoading || authController.confirmationResult))}
                           type="phone"
                           onChange={(event) => setPhone(event.target.value)}/>
                {Boolean(phone && authController.confirmationResult) &&
                    <>
                        <div className="mt-2 p-1 flex">
                            <Typography align={"center"}
                                        variant={"subtitle2"}>{"Please enter the confirmation code"}</Typography>
                        </div>
                        <TextField placeholder=""
                                   value={code ?? ""}
                                   type="text"
                                   onChange={(event) => setCode(event.target.value)}/>
                    </>
                }

                <div className="flex justify-end items-center w-full">

                    {authController.authLoading &&
                        <CircularProgress className="p-1" size={"small"}/>
                    }

                    <Button type="submit">
                        {"Ok"}
                    </Button>
                </div>

            </div>
        </form>
    );
}

type LoginFormMode = "email" | "password" | "registration";

function LoginForm({
                       onClose,
                       authController,
                       mode,
                       noUserComponent,
                       disableSignupScreen,
                       disableResetPassword
                   }: {
    onClose: () => void,
    authController: FirebaseAuthController,
    mode: "light" | "dark",
    noUserComponent?: ReactNode,
    disableSignupScreen: boolean,
    disableResetPassword?: boolean
}) {

    const passwordRef = useRef<HTMLInputElement | null>(null);

    const [loginState, setLoginState] = useState<LoginFormMode>("email"); // ["email", "password", "registration"]
    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [previouslyUsedMethodsForUser, setPreviouslyUsedMethodsForUser] = useState<string[] | undefined>();
    const [resettingPassword, setResettingPassword] = useState(false);

    const snackbarController = useSnackbarController();

    useEffect(() => {
        if ((loginState === "password" || loginState === "registration") && passwordRef.current) {
            passwordRef.current.focus()
        }
    }, [loginState]);

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
                setPreviouslyUsedMethodsForUser(availableProviders.filter(p => p !== "password"));
            });
            setLoginState("password");
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
        if (loginState === "email") {
            onClose();
        } else if (loginState === "password" || loginState === "registration") {
            setLoginState("email");
        } else {
            setPreviouslyUsedMethodsForUser(undefined);
        }
    }

    const handleSubmit = (event: any) => {
        event.preventDefault();
        if (loginState === "email") {
            handleEnterEmail();
        } else if (loginState === "password") {
            handleEnterPassword();
        } else if (loginState === "registration") {
            handleRegistration();
        }
    }

    const label = loginState === "registration"
        ? "Please enter your email and password to create an account"
        : (loginState === "password" ? "Please enter your password" : "Please enter your email");

    return (
        <form
            className={"w-full"}
            onSubmit={handleSubmit}>

            <div className={"max-w-[480px] w-full flex flex-col gap-4"}>
                <IconButton
                    onClick={onBackPressed}>
                    <ArrowBackIcon className="w-5 h-5"/>
                </IconButton>

                <div>
                    {loginState === "registration" && noUserComponent}
                </div>

                <Typography
                    className={`${loginState === "registration" && disableSignupScreen ? "hidden" : "flex"}`}
                    variant={"subtitle2"}>{label}</Typography>

                {(loginState === "email" || loginState === "registration") && <TextField placeholder="Email" autoFocus
                                                                                         value={email ?? ""}
                                                                                         disabled={authController.authLoading}
                                                                                         type="email"
                                                                                         onChange={(event) => setEmail(event.target.value)}/>}

                <div
                    className={`${loginState === "password" || (loginState === "registration" && !disableSignupScreen) ? "block" : "hidden"}`}>
                    <TextField placeholder="Password"
                               value={password ?? ""}
                               disabled={authController.authLoading}
                               inputRef={passwordRef}
                               type="password"
                               onChange={(event) => setPassword(event.target.value)}/>
                </div>

                <div
                    className={`${loginState === "registration" && disableSignupScreen ? "hidden" : "flex"} justify-end items-center w-full flex gap-2`}>

                    {authController.authLoading &&
                        <CircularProgress className="p-1" size={"small"}/>
                    }

                    {!disableResetPassword && <LoadingButton variant="text"
                                                             loading={resettingPassword}
                                                             onClick={email
                                                                 ? async () => {
                                                                     setResettingPassword(true);
                                                                     try {
                                                                         try {
                                                                             await authController.sendPasswordResetEmail(email);
                                                                             snackbarController.open({
                                                                                 message: "Password reset email sent",
                                                                                 type: "success"
                                                                             });
                                                                         } catch (e: any) {
                                                                             snackbarController.open({
                                                                                 message: e.message,
                                                                                 type: "error"
                                                                             });
                                                                         }
                                                                     } finally {
                                                                         setResettingPassword(false);
                                                                     }
                                                                 }
                                                                 : undefined}>
                        Reset password
                    </LoadingButton>}

                    {!disableSignupScreen && loginState === "email" &&
                        <Button variant="text" onClick={() => setLoginState("registration")}>
                            New user
                        </Button>}

                    <Button type="submit">
                        {loginState === "registration" ? "Create account" : (loginState === "password" ? "Login" : "Login")}
                    </Button>
                </div>

                {previouslyUsedMethodsForUser && previouslyUsedMethodsForUser.length > 0 &&
                    <div className={"flex flex-col gap-4 p-4"}>
                        <div>
                            <Typography variant={"subtitle2"}>
                                You already have an account
                            </Typography>
                            <Typography variant={"body2"}>
                                You can use one of these
                                methods to login with {email}
                            </Typography>
                        </div>

                        <div>
                            {previouslyUsedMethodsForUser && buildOauthLoginButtons(authController, previouslyUsedMethodsForUser, mode, false)}
                        </div>
                    </div>
                }
            </div>
        </form>
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
