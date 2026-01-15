import React, { ReactNode, useEffect, useRef, useState } from "react";

import { ArrowBackIcon, Button, CircularProgress, IconButton, MailIcon, TextField, Typography } from "@firecms/ui";
import { ErrorView, FireCMSLogo, useModeController } from "@firecms/core";

import { CustomAuthController } from "../types";

/**
 * Props for CustomLoginView
 */
export interface CustomLoginViewProps {
    /**
     * Auth controller from useCustomAuthController
     */
    authController: CustomAuthController;

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
     * Prevent users from creating new accounts
     */
    disableSignupScreen?: boolean;

    /**
     * Display this component when no user is found
     */
    noUserComponent?: ReactNode;

    /**
     * Display this component below the sign-in buttons
     */
    additionalComponent?: ReactNode;

    /**
     * Error message when user is not allowed access
     */
    notAllowedError?: any;

    /**
     * Enable Google login button (requires googleClientId in hook)
     */
    googleEnabled?: boolean;

    /**
     * Google client ID for OAuth
     */
    googleClientId?: string;
}

/**
 * Login view component for custom JWT authentication
 * Based on MongoLoginView pattern from @firecms/mongodb
 */
export function CustomLoginView({
    logo,
    authController,
    noUserComponent,
    disableSignupScreen = false,
    disabled = false,
    notAllowedError,
    googleEnabled = false,
    googleClientId
}: CustomLoginViewProps) {

    const modeState = useModeController();

    const [registrationSelected, setRegistrationSelected] = useState(false);
    const [passwordLoginSelected, setPasswordLoginSelected] = useState(false);

    function buildErrorView() {
        if (!authController.authProviderError) return null;
        if (authController.user != null) return null;
        return <ErrorView error={authController.authProviderError.message ?? authController.authProviderError} />;
    }

    let logoComponent;
    if (logo) {
        logoComponent = <img src={logo}
            style={{
                height: "100%",
                width: "100%",
                objectFit: "cover"
            }}
            alt={"Logo"} />;
    } else {
        logoComponent = <FireCMSLogo />;
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
                    <>
                        <LoginButton
                            disabled={disabled}
                            text={"Email/password"}
                            icon={<MailIcon size={"large"} />}
                            onClick={() => {
                                setRegistrationSelected(false);
                                setPasswordLoginSelected(true);
                            }}
                        />
                        {googleEnabled && googleClientId && (
                            <GoogleLoginButton
                                disabled={disabled}
                                googleClientId={googleClientId}
                                authController={authController}
                            />
                        )}
                        {!disableSignupScreen && (
                            <LoginButton
                                disabled={disabled}
                                text={"Create account"}
                                icon={<MailIcon size={"large"} />}
                                onClick={() => {
                                    setRegistrationSelected(true);
                                    setPasswordLoginSelected(false);
                                }}
                            />
                        )}
                    </>
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

function LoginButton({
    icon,
    onClick,
    text,
    disabled
}: { icon: React.ReactNode, onClick: () => void, text: string, disabled?: boolean }) {
    return (
        <div className="m-2 w-full">
            <Button
                disabled={disabled}
                className={`w-full`}
                onClick={onClick}>
                <div className="flex items-center justify-center p-2 w-full h-8">
                    <div className="flex flex-col items-center justify-center w-8">
                        {icon}
                    </div>
                    <div className="grow pl-2 text-center">
                        {text}
                    </div>
                </div>
            </Button>
        </div>
    )
}

function GoogleLoginButton({
    disabled,
    googleClientId,
    authController
}: {
    disabled?: boolean,
    googleClientId: string,
    authController: CustomAuthController
}) {
    const handleGoogleLogin = async () => {
        try {
            const { google } = window as any;
            if (!google) {
                console.error("Google Sign-In not loaded");
                return;
            }

            google.accounts.id.initialize({
                client_id: googleClientId,
                callback: async (response: any) => {
                    try {
                        await authController.googleLogin(response.credential);
                    } catch (err: any) {
                        console.error("Google login error:", err);
                    }
                }
            });

            google.accounts.id.prompt();
        } catch (err: any) {
            console.error("Google login error:", err);
        }
    };

    return (
        <div className="m-2 w-full">
            <Button
                disabled={disabled}
                className={`w-full`}
                onClick={handleGoogleLogin}>
                <div className="flex items-center justify-center p-2 w-full h-8">
                    <div className="flex flex-col items-center justify-center w-8">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    </div>
                    <div className="grow pl-2 text-center">
                        Continue with Google
                    </div>
                </div>
            </Button>
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
    authController: CustomAuthController,
    mode: "light" | "dark",
    registrationMode: boolean,
    noUserComponent?: ReactNode,
    disableSignupScreen: boolean
}) {

    const passwordRef = useRef<HTMLInputElement | null>(null);

    const [email, setEmail] = useState<string>();
    const [password, setPassword] = useState<string>();
    const [displayName, setDisplayName] = useState<string>();

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
            authController.register(email, password, displayName);
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
        ? "Create a new account"
        : "Enter your email and password";

    const button = registrationMode ? "Create account" : "Login";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col items-center w-full max-w-[500px] gap-2">
            <div className="w-full">
                <IconButton onClick={onBackPressed}>
                    <ArrowBackIcon />
                </IconButton>
            </div>

            <div className="flex justify-center w-full py-2">
                <Typography align={"center"} variant={"subtitle2"}>{label}</Typography>
            </div>

            {registrationMode && (
                <div className="w-full">
                    <TextField placeholder="Display Name (optional)"
                        className={"w-full"}
                        value={displayName ?? ""}
                        disabled={authController.initialLoading}
                        type="text"
                        onChange={(event) => setDisplayName(event.target.value)} />
                </div>
            )}

            <div className="w-full">
                <TextField placeholder="Email"
                    className={"w-full"}
                    autoFocus
                    value={email ?? ""}
                    disabled={authController.initialLoading}
                    type="email"
                    onChange={(event) => setEmail(event.target.value)} />
            </div>

            <div className="w-full">
                {registrationMode && noUserComponent}
            </div>

            <div className="w-full">
                <TextField placeholder="Password"
                    className={"w-full"}
                    value={password ?? ""}
                    disabled={authController.initialLoading}
                    inputRef={passwordRef}
                    type="password"
                    onChange={(event) => setPassword(event.target.value)} />
            </div>

            {registrationMode && (
                <Typography variant="caption" className="text-gray-500 text-sm">
                    Password: 8+ chars, uppercase, lowercase, number
                </Typography>
            )}

            <div className="flex justify-end items-center w-full gap-2">
                {authController.authLoading && (
                    <CircularProgress />
                )}
                <Button type="submit" disabled={authController.authLoading}>
                    {button}
                </Button>
            </div>
        </form>
    );
}
