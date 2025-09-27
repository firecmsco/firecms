import React, { useEffect, useState } from "react";

import { BooleanSwitchWithLabel, MailIcon, Typography } from "@firecms/ui";
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
                                          includeTermsAndNewsLetter
                                      }: FireCMSCloudLoginViewProps) {

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [passwordLoginSelected, setPasswordLoginSelected] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, 10);
        return () => clearTimeout(timer);
    }, []);

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

        <div className="flex flex-col items-center justify-center min-w-full p-2 " style={fadeStyle}>
            {includeLogo && <div className={"m-4"} style={{
                width: "200px",
                height: "200px"
            }}>
                <FireCMSLogo/>
            </div>}

            {includeLogo && <Typography variant={"h4"}
                                        color={"primary"}
                                        className="mb-4">
                FireCMS <Typography variant={"h4"}
                                    component={"span"}
                                    className={"text-blue-500"}>CLOUD</Typography>
            </Typography>}

            <div className={"min-w-[480px]"}>
                {includeTermsAndNewsLetter &&
                    <div className={"mb-4"}>
                        <BooleanSwitchWithLabel size="small"
                                                invisible={true}
                                                value={subscribeToNewsletter}
                                                onValueChange={setSubscribeToNewsletter}
                                                position={"start"}
                                                label={
                                                    <Typography variant={"caption"} color={"primary"}>
                                                        Join our newsletter. No spam, only important
                                                        updates!
                                                    </Typography>}/>
                        {!passwordLoginSelected && <BooleanSwitchWithLabel size="small"
                                                                           invisible={true}
                                                                           value={termsAccepted}
                                                                           onValueChange={setTermsAccepted}
                                                                           position={"start"}
                                                                           label={
                                                                               <Typography variant={"caption"}
                                                                                           color={"primary"}>
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
                                                                           }/>}
                    </div>}

                {!passwordLoginSelected && <GoogleLoginButton
                    disabled={!termsAccepted && includeTermsAndNewsLetter}
                    onClick={() => {
                        fireCMSBackend.googleLogin(includeGoogleAdminScopes).then((user) => {
                            if (subscribeToNewsletter && user?.email) {
                                subscribeNewsletter(user.email);
                            }
                        });
                    }}/>}

                {!includeGoogleAdminScopes && !passwordLoginSelected && <LoginButton
                    disabled={!termsAccepted && includeTermsAndNewsLetter}
                    text={"Email/password"}
                    icon={<MailIcon size={24}/>}
                    onClick={() => setPasswordLoginSelected(true)}/>}


                {includeGoogleAdminScopes &&
                    fireCMSBackend.permissionsNotGrantedError &&
                    <ErrorView
                        error={"You need to grant additional permissions in order to manage your Google Cloud projects"}/>}

                {passwordLoginSelected && <CloudUserPasswordForm
                    fireCMSBackend={fireCMSBackend}
                    onClose={() => setPasswordLoginSelected(false)}
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
