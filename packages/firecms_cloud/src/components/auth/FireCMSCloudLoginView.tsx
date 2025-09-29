import React, { useEffect, useState } from "react";

import { Checkbox, Label, MailIcon, Typography } from "@firecms/ui";
import { ErrorView, FireCMSLogo } from "@firecms/core";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { FireCMSBackend } from "../../types";
import { LoginButton } from "@firecms/firebase";
import { CloudUserPasswordForm } from "./CloudUserPasswordForm";

export interface FireCMSCloudLoginViewProps {
    fireCMSBackend: FireCMSBackend;
    includeGoogleAdminScopes: boolean;
    includeLogo: boolean;
    includeGoogleDisclosure: boolean;
    includeTermsAndNewsLetter: boolean;
    onAnalyticsEvent?: (event: string, params?: object) => void;

}

/**
 * Use this component to render a login view, that updates
 * the state of the {@link AuthController} based on the result

 * @group Firebase
 */
export function FireCMSCloudLoginView({
                                          fireCMSBackend,
                                          includeGoogleAdminScopes,
                                          includeLogo,
                                          includeGoogleDisclosure,
                                          includeTermsAndNewsLetter,
                                          onAnalyticsEvent
                                      }: FireCMSCloudLoginViewProps) {

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [passwordLoginSelected, setPasswordLoginSelected] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, 10);
        onAnalyticsEvent?.("view_displayed");
        return () => clearTimeout(timer);
    }, [onAnalyticsEvent]);

    function buildErrorView() {
        let errorView: any;
        const ignoredCodes = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];
        if (fireCMSBackend.authProviderError && !ignoredCodes.includes(fireCMSBackend.authProviderError.code)) {

            if (fireCMSBackend.authProviderError.code === "auth/user-not-found")
                errorView =
                    <ErrorView error={"User not found"}/>;
            else if (fireCMSBackend.authProviderError.code === "auth/wrong-password")
                errorView =
                    <ErrorView error={"Wrong password. Please try again."}/>;
            else if (fireCMSBackend.authProviderError.code === "auth/user-disabled")
                errorView =
                    <ErrorView error={"User disabled. Please contact support."}/>;
            else if (fireCMSBackend.authProviderError.code === "auth/account-exists-with-different-credential")
                errorView =
                    <ErrorView error={"Account exists with different sign in method"}/>;
            else if (fireCMSBackend.authProviderError.code === "auth/email-already-in-use")
                errorView =
                    <ErrorView error={"The email is already in use"}/>;
            else
                errorView =
                    <ErrorView error={fireCMSBackend.authProviderError}/>;
        }
        return errorView;
    }

    const fadeStyle = {
        opacity: fadeIn ? 1 : 0,
        transition: "opacity 0.6s ease-in-out"
    };

    return (
        <div className="fixed inset-0 flex flex-col lg:flex-row m-0 p-0 overflow-y-auto" style={fadeStyle}>
            {/* Marketing Section - Left Side (Desktop only) */}
            <div className="hidden lg:flex lg:w-1/2 bg-primary text-white flex-col justify-center items-center p-12 m-0">
                <div className="max-w-md">
                    <Typography variant="h5" className="font-mono uppercase mb-8 text-white ">
                        The most powerful headless CMS for Firebase projects
                    </Typography>
                    <ul className="space-y-3 text-left list-disc list-inside marker:text-white">
                        <li>
                            <Typography variant="body1" className="text-blue-50 inline">
                                Build admin panels in <b>minutes</b>, not weeks
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" className="text-blue-50 inline">
                                Automatic collection mapping
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" className="text-blue-50 inline">
                                <b>Real-time</b> data management with Firebase integration
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" className="text-blue-50 inline">
                                Advanced <b>user roles</b> and permissions
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body1" className="text-blue-50 inline">
                                <b>Customizable</b> components and workflows
                            </Typography>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Login Content - Right Side */}
            <div className="flex flex-col items-center justify-center w-full lg:w-1/2 h-full min-h-screen lg:min-h-0 p-8 m-0">
                {includeLogo && (
                    <div className="m-4" style={{
                        width: "160px",
                        height: "160px"
                    }}>
                        <FireCMSLogo/>
                    </div>
                )}

                {includeLogo && (
                    <Typography variant={"h4"}
                                color={"primary"}
                                className="mb-4">
                        FireCMS <Typography variant={"h4"}
                                            component={"span"}
                                            className={"text-primary"}>CLOUD</Typography>
                    </Typography>
                )}

                <div className={"w-full max-w-md"}>
                    {includeTermsAndNewsLetter &&
                        <div className={"mb-4"}>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="newsletter-checkbox"
                                    checked={subscribeToNewsletter}
                                    onCheckedChange={setSubscribeToNewsletter}
                                    size="small"
                                />
                                <Label htmlFor="newsletter-checkbox">
                                    <Typography variant={"caption"} color={"primary"}>
                                        Join our newsletter. No spam, only important
                                        updates!
                                    </Typography>
                                </Label>
                            </div>
                            {!passwordLoginSelected && <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="terms-checkbox"
                                    checked={termsAccepted}
                                    onCheckedChange={setTermsAccepted}
                                    size="small"
                                />
                                <Label htmlFor="terms-checkbox">
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
                                </Label>
                            </div>}
                        </div>}

                    {!passwordLoginSelected && <GoogleLoginButton
                        disabled={!termsAccepted && includeTermsAndNewsLetter}
                        onClick={() => {
                            onAnalyticsEvent?.("google_attempt");
                            fireCMSBackend.googleLogin(includeGoogleAdminScopes).then((user) => {
                                onAnalyticsEvent?.("google_success");
                                if (subscribeToNewsletter && user?.email) {
                                    subscribeNewsletter(user.email);
                                }
                            }).catch((error) => {
                                onAnalyticsEvent?.("google_error", { error: error?.code });
                            });
                        }}/>}

                    {!includeGoogleAdminScopes && !passwordLoginSelected && <LoginButton
                        disabled={!termsAccepted && includeTermsAndNewsLetter}
                        text={"Email/password"}
                        icon={<MailIcon size={24}/>}
                        onClick={() => {
                            onAnalyticsEvent?.("password_method_selected");
                            setPasswordLoginSelected(true);
                        }}/>}


                    {includeGoogleAdminScopes &&
                        fireCMSBackend.permissionsNotGrantedError &&
                        <ErrorView
                            error={"You need to grant additional permissions in order to manage your Google Cloud projects"}/>}

                    {passwordLoginSelected && <CloudUserPasswordForm
                        fireCMSBackend={fireCMSBackend}
                        onClose={() => setPasswordLoginSelected(false)}
                        onAnalyticsEvent={onAnalyticsEvent}
                    />}


                    {buildErrorView()}

                    {includeGoogleDisclosure && <Typography variant={"caption"} className={"mt-4"}>
                        FireCMS Cloud use and transfer to any other app of
                        information
                        received from Google APIs will adhere to <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={"https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes"}>Google
                        API Services
                        User Data Policy</a>, including the Limited Use
                        requirements.
                    </Typography>}
                </div>
            </div>
        </div>
    );

}

const subscribeNewsletter = (email: string) => {
    const url = "https://api-drplyi3b6q-ey.a.run.app/notifications/newsletter";
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email_address: email,
            source: "saas"
        })
    }).then((res) => {
    });
}
