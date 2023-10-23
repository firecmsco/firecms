import React, { ReactNode, useCallback, useState } from "react";

import { FirebaseApp } from "firebase/app";
import { BooleanSwitchWithLabel, Button, ErrorView, FireCMSLogo, Typography, } from "@firecms/core";
import { FirebaseSignInOption, FirebaseSignInProvider, FireCMSBackend } from "../../types/auth";
import { googleIcon } from "./social_icons";
import {
    getAuth,
    getMultiFactorResolver,
    PhoneAuthProvider,
    PhoneMultiFactorGenerator,
    RecaptchaVerifier
} from "firebase/auth";

/**
 * @category Firebase
 */
export interface FireCMS3LoginViewProps {

    /**
     * Firebase app this login view is accessing
     */
    firebaseApp: FirebaseApp;

    /**
     * Delegate holding the auth state
     */
    authController: FireCMSBackend;

    /**
     * Path to the logo displayed in the login screen
     */
    logo?: string;

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
                                      logo,
                                      signInOptions,
                                      firebaseApp,
                                      authController,
                                      noUserComponent,
                                      disableSignupScreen = false,
                                      disabled = false,
                                      additionalComponent,
                                      notAllowedError
                                  }: FireCMS3LoginViewProps) {

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

    // const [phoneLoginSelected, setPhoneLoginSelected] = useState(false);

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
                    <>
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
                    </>;
            } else if (authController.authProviderError.code === "auth/invalid-api-key") {
                errorView = <div className="p-4">
                    <ErrorView
                        title={"Invalid API key"}
                        error={"auth/invalid-api-key: Check that your Firebase config is set correctly in your `firebase-config.ts` file"}/>
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

        <div
            className="flex flex-col items-center justify-center min-h-screen min-w-full p-2">
            <div id="recaptcha"></div>
            <div
                className="flex flex-col items-center w-full max-w-[500px]">

                <div className="p-1 w-64 h-64 m-4">
                    {logoComponent}
                </div>

                <>
                    <BooleanSwitchWithLabel size="small"
                                            invisible={true}
                                            value={newsletterSubscribed}
                                            onValueChange={setNewsletterSubscribed}
                                            position={"start"}
                                            label={
                                                <Typography variant={"caption"} color={"primary"}>
                                                    Join our newsletter. No spam, only important
                                                    updates!
                                                </Typography>}/>
                    <BooleanSwitchWithLabel size="small"
                                            invisible={true}
                                            value={termsAccepted}
                                            onValueChange={setTermsAccepted}
                                            position={"start"}
                                            label={
                                                <Typography variant={"caption"} color={"primary"}>
                                                    By signing in you agree to our <a
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href={"https://firecms.co/policy/terms_conditions"}>
                                                    Terms and Conditions</a> and our <a
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href={"https://firecms.co/policy/privacy_policy"}>
                                                    Privacy policy</a>
                                                </Typography>
                                            }/>
                </>

                {notAllowedMessage &&
                    <div className="p-8">
                        <ErrorView error={notAllowedMessage}/>
                    </div>}

                {buildErrorView()}

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
        <div className="m-1 w-full">
            <Button
                className="w-full"
                variant="outlined"
                disabled={disabled}
                onClick={onClick}>
                <div
                    className="p-1 flex h-8 items-center justify-items-center">
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

// function PhoneLoginForm({
//                             onClose,
//                             authController
//                         }: {
//     onClose: () => void,
//     authController: FirebaseAuthController,
// }) {
//     useRecaptcha();
//
//     const [phone, setPhone] = useState<string>();
//     const [code, setCode] = useState<string>();
//     const [isInvalidCode, setIsInvalidCode] = useState(false);
//
//     const handleSubmit = async (event: any) => {
//         event.preventDefault();
//
//         if (code && authController.confirmationResult) {
//             setIsInvalidCode(false);
//
//             authController.confirmationResult.confirm(code).catch((e: FirebaseError) => {
//                 if (e.code === "auth/invalid-verification-code") {
//                     setIsInvalidCode(true)
//                 }
//             });
//         } else {
//             if (phone) {
//                 authController.phoneLogin(phone, window.recaptchaVerifier);
//             }
//         }
//     }
//
//     return (
//         <form onSubmit={handleSubmit}>
//             {isInvalidCode &&
//                 <div className="p-8">
//                     <ErrorView error={"Invalid confirmation code"}/>
//                 </div>}
//
//             <div id={RECAPTCHA_CONTAINER_ID}/>
//
//             <div className={"flex flex-col gap-1"}>
//                 <IconButton
//                     onClick={onClose}>
//                     <ArrowBackIcon className="w-5 h-5"/>
//                 </IconButton>
//                 <div className="p-1 flex">
//                     <Typography align={"center"}
//                                 variant={"subtitle2"}>{"Please enter your phone number"}</Typography>
//                 </div>
//                 <TextField placeholder=""
//                            value={phone ?? ""}
//                            disabled={Boolean(phone && (authController.authLoading || authController.confirmationResult))}
//                            type="phone"
//                            onChange={(event) => setPhone(event.target.value)}/>
//                 {Boolean(phone && authController.confirmationResult) &&
//                     <>
//                         <div className="mt-2 p-1 flex">
//                             <Typography align={"center"}
//                                         variant={"subtitle2"}>{"Please enter the confirmation code"}</Typography>
//                         </div>
//                         <TextField placeholder=""
//                                    value={code ?? ""}
//                                    type="text"
//                                    onChange={(event) => setCode(event.target.value)}/>
//                     </>
//                 }
//
//                 <div className="flex justify-end items-center w-full">
//
//                     {authController.authLoading &&
//                         <CircularProgress className="p-1" size={"small"}/>
//                     }
//
//                     <Button type="submit">
//                         {"Ok"}
//                     </Button>
//                 </div>
//
//             </div>
//         </form>
//     );
// }

function buildOauthLoginButtons(authController: FireCMSBackend, providers: string[], mode: "light" | "dark", disabled: boolean) {
    return <>
        {providers.includes("google.com") && <LoginButton
            disabled={disabled}
            text={"Sign in with Google"}
            icon={googleIcon()}
            onClick={authController.googleLogin}/>}

        {/*{providers.includes("microsoft.com") && <LoginButton*/}
        {/*    disabled={disabled}*/}
        {/*    text={"Sign in with Microsoft"}*/}
        {/*    icon={microsoftIcon(mode)}*/}
        {/*    onClick={authController.microsoftLogin}/>}*/}

        {/*{providers.includes("apple.com") && <LoginButton*/}
        {/*    disabled={disabled}*/}
        {/*    text={"Sign in with Apple"}*/}
        {/*    icon={appleIcon(mode)}*/}
        {/*    onClick={authController.appleLogin}/>}*/}

        {/*{providers.includes("github.com") && <LoginButton*/}
        {/*    disabled={disabled}*/}
        {/*    text={"Sign in with Github"}*/}
        {/*    icon={githubIcon(mode)}*/}
        {/*    onClick={authController.githubLogin}/>}*/}

        {/*{providers.includes("facebook.com") && <LoginButton*/}
        {/*    disabled={disabled}*/}
        {/*    text={"Sign in with Facebook"}*/}
        {/*    icon={facebookIcon(mode)}*/}
        {/*    onClick={authController.facebookLogin}/>}*/}

        {/*{providers.includes("twitter.com") && <LoginButton*/}
        {/*    disabled={disabled}*/}
        {/*    text={"Sign in with Twitter"}*/}
        {/*    icon={twitterIcon(mode)}*/}
        {/*    onClick={authController.twitterLogin}/>}*/}
    </>
}
