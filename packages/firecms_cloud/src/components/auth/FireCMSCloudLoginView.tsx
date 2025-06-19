import React, { useState, useEffect } from "react";

import { BooleanSwitchWithLabel, Typography } from "@firecms/ui";
import { ErrorView, FireCMSLogo } from "@firecms/core";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { FireCMSBackend } from "../../types";

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

    useEffect(() => {
        // Trigger the fade-in effect on component mount
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, 50); // Small delay to ensure transition works properly

        return () => clearTimeout(timer);
    }, []);

    function buildErrorView() {
        let errorView: any;
        const ignoredCodes = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];
        if (fireCMSBackend.authProviderError && !ignoredCodes.includes(fireCMSBackend.authProviderError.code)) {
            errorView =
                <div className={"p-4"}>
                    <ErrorView error={fireCMSBackend.authProviderError}/>
                </div>;
        }
        return errorView;
    }

    const fadeStyle = {
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 0.6s ease-in-out'
    };

    return (

        <div className="flex flex-col items-center justify-center min-w-full p-2" style={fadeStyle}>
            {includeLogo && <div className={"m-4"} style={{
                width: "260px",
                height: "260px"
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

            {buildErrorView()}

            {includeTermsAndNewsLetter &&
                <>
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
                </>}

            <GoogleLoginButton
                disabled={!termsAccepted && includeTermsAndNewsLetter}
                onClick={() => {
                    fireCMSBackend.googleLogin(includeGoogleAdminScopes).then((user) => {
                        if (subscribeToNewsletter && user?.email) {
                            subscribeNewsletter(user.email);
                        }
                    });
                }}/>

            {includeGoogleAdminScopes &&
                fireCMSBackend.permissionsNotGrantedError &&
                <ErrorView
                    error={"You need to grant additional permissions in order to manage your Google Cloud projects"}/>}

            {includeGoogleDisclosure && <Typography variant={"caption"}>
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
