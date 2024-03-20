import React, { useEffect, useRef, useState } from "react";

import { BooleanSwitchWithLabel, Typography } from "@firecms/ui";
import { ErrorView, FireCMSLogo } from "@firecms/core";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { FireCMSBackend } from "../../types";

export interface FireCMSLoginViewProps {
    authController: FireCMSBackend;
    includeGoogleAdminScopes: boolean;
    includeLogo: boolean;
    includeGoogleDisclosure: boolean;
    includeTermsAndNewsLetter: boolean;
}

/**
 * Use this component to render a login view, that updates
 * the state of the {@link AuthController} based on the result
 * @constructor
 * @group Firebase
 */
export function FireCMSLoginView({
                                  authController,
                                  includeGoogleAdminScopes,
                                  includeLogo,
                                  includeGoogleDisclosure,
                                  includeTermsAndNewsLetter
                              }: FireCMSLoginViewProps) {

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

    const submittedNewsletter = useRef(false);

    useEffect(() => {
        if (newsletterSubscribed && authController.user?.email && !submittedNewsletter.current) {
            submittedNewsletter.current = true;
            handleSubmit(authController.user.email);
        }
    }, [newsletterSubscribed, authController.user]);

    function buildErrorView() {
        let errorView: any;
        const ignoredCodes = ["auth/popup-closed-by-user", "auth/cancelled-popup-request"];
        if (authController.authProviderError && !ignoredCodes.includes(authController.authProviderError.code)) {
            errorView =
                <div className={"p-4"}>
                    <ErrorView error={authController.authProviderError}/>
                </div>;
        }
        return errorView;
    }

    return (

        <div className="flex flex-col items-center justify-center min-w-full p-2">
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
                </>}

            <GoogleLoginButton
                disabled={!termsAccepted && includeTermsAndNewsLetter}
                onClick={() => {
                    authController.googleLogin(includeGoogleAdminScopes);
                }}/>

            {includeGoogleAdminScopes &&
                authController.permissionsNotGrantedError &&
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

const handleSubmit = (email: string) => {
    fetch("https://europe-west3-firecms-demo-27150.cloudfunctions.net/sign_up_newsletter", {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            email_address: email,
            source: "demo-saas"
        })
    }).then((res) => {
        console.log("newsletter response", res);
    });
}
