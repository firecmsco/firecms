import React, { ReactNode, useEffect, useRef, useState } from "react";

import {
    ArrowBackIcon,
    EmailIcon,
    ErrorView,
    FireCMSLogo,
    IconButton,
    TextField,
    useModeController
} from "@firecms/firebase_pro";

import { MongoAuthController } from "../useMongoAuthController";
import { Button, CircularProgress, Typography } from "@firecms/ui";

/**
 *
 */
export interface MongoLoginViewProps {

    /**
     * Delegate holding the auth state
     */
    authController: MongoAuthController;

    /**
     * Path to the logo displayed in the login screen
     */
    logo?: string;

    /**
     * Enable the skip login button
     */
    allowSkipLogin?: boolean;

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

    registrationEnabled?: boolean;

}

/**
 * Use this component to render a login view, that updates
 * the state of the {@link MongoAuthController} based on the result
 * @constructor
 *
 */
export function MongoLoginView({
                                   logo,
                                   authController,
                                   noUserComponent,
                                   disableSignupScreen = false,
                                   disabled = false,
                                   notAllowedError,
                                   registrationEnabled
                               }: MongoLoginViewProps) {

    const modeState = useModeController();

    const [registrationSelected, setRegistrationSelected] = useState(false);
    const [passwordLoginSelected, setPasswordLoginSelected] = useState(false);

    function buildErrorView() {
        if (!authController.authProviderError) return null;
        if (authController.user != null) return null; // if the user is logged in via MFA
        return <ErrorView
            error={authController.authProviderError?.error ?? authController.authProviderError?.errorCode ?? authController.authProviderError}/>;
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
        <div className="flex flex-col justify-center items-center min-h-screen min-w-full p-2">
            <div id="recaptcha"></div>
            <div className="flex flex-col items-center w-full max-w-md">
                <div className={`m-4 p-4 w-64 h-64`}>
                    {logoComponent}
                </div>
                {notAllowedMessage &&
                    <div className="p-4">
                        <ErrorView error={notAllowedMessage} />
                    </div>
                }
                {buildErrorView()}
                {(!passwordLoginSelected && !registrationSelected) && (
                    <LoginButton
                        disabled={disabled}
                        text={"Email/password"}
                        icon={<EmailIcon size={"large"} />}
                        onClick={() => {
                            setRegistrationSelected(false);
                            setPasswordLoginSelected(true);
                        }}
                    />
                )}
                {(!passwordLoginSelected && !registrationSelected) && registrationEnabled && (
                    <LoginButton
                        disabled={disabled}
                        text={"Register"}
                        icon={<EmailIcon size={"large"} />}
                        onClick={() => {
                            setRegistrationSelected(true);
                            setPasswordLoginSelected(false);
                        }}
                    />
                )}
                {(passwordLoginSelected || registrationSelected) && (
                    <LoginForm
                        authController={authController}
                        registrationMode={registrationSelected}
                        onClose={() => {
                            setRegistrationSelected(false);
                            setPasswordLoginSelected(false);
                        }}
                        mode={modeState.mode}
                        noUserComponent={noUserComponent}
                        disableSignupScreen={disableSignupScreen}
                    />
                )}
            </div>
        </div>
    );
}

export function LoginButton({
                                icon,
                                onClick,
                                text,
                                disabled
                            }: { icon: React.ReactNode, onClick: () => void, text: string, disabled?: boolean }) {
    return (
        <div className="m-2 w-full">
            <button className={`w-full border-2 border-solid ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={disabled} onClick={onClick}>
                <div className="flex items-center justify-center p-2 w-full h-8">
                    <div className="flex flex-col items-center justify-center w-8">
                        {icon}
                    </div>
                    <div className="flex-grow pl-2 text-center">
                        {text}
                    </div>
                </div>
            </button>
        </div>
    )
}

function LoginForm({
                       onClose,
                       authController,
                       mode,
                       registrationMode,
                       noUserComponent,
                       disableSignupScreen
                   }: {
    onClose: () => void,
    authController: MongoAuthController,
    mode: "light" | "dark",
    registrationMode: boolean,
    noUserComponent?: ReactNode,
    disableSignupScreen: boolean
}) {

    const passwordRef = useRef<HTMLInputElement | null>(null);

    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();

    const loginMode = !registrationMode;

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

    function handleEnterPassword() {
        if (email && password) {
            authController.emailPasswordLogin(email, password);
        }
    }

    function handleRegistration() {
        if (email && password) {
            authController.register(email, password);
        }
    }

    const onBackPressed = () => {
        onClose();
    }

    const handleSubmit = (event: any) => {
        event.preventDefault();
        if (registrationMode)
            handleRegistration();
        else
            handleEnterPassword();
    }
    const label = registrationMode
        ? "Pick an email and password to create a new account"
        : (loginMode ? "Please enter your password" : "Please enter your email");

    const button = registrationMode ? "Create account" : (loginMode ? "Login" : "Ok");

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-2">
                <div className="w-full">
                    <IconButton onClick={onBackPressed}>
                        <ArrowBackIcon/>
                    </IconButton>
                </div>

                <div
                    className={`${registrationMode && disableSignupScreen ? "hidden" : "flex justify-center"} w-full py-2`}>
                    <Typography align={"center"} variant={"subtitle2"}>{label}</Typography>
                </div>

                <div className="w-full inherit">
                    <TextField placeholder="Email"
                               autoFocus
                               value={email ?? ""}
                               disabled={authController.initialLoading}
                               type="email"
                               onChange={(event) => setEmail(event.target.value)}/>
                </div>

                <div className="w-full">
                    {registrationMode && noUserComponent}
                </div>

                <div
                    className={`${loginMode || (registrationMode && !disableSignupScreen) ? "inherit" : "hidden"} w-full`}>
                    <TextField placeholder="Password"
                               value={password ?? ""}
                               disabled={authController.initialLoading}
                               inputRef={passwordRef}
                               type="password"
                               onChange={(event) => setPassword(event.target.value)}/>
                </div>

                <div
                    className={`${registrationMode && disableSignupScreen ? "hidden" : "flex justify-end items-center"} w-full`}>
                    {authController.initialLoading && (
                        <CircularProgress/>
                    )}
                    <Button type="submit" variant={"outlined"}>
                        {button}
                    </Button>
                </div>
            </div>
        </form>
    );

}
