import { useEffect, useRef, useState } from "react";
import { Alert, BooleanSwitchWithLabel, OpenInNewIcon, Typography } from "@firecms/ui";
import { FirebaseLoginView, FirebaseLoginViewProps } from "@firecms/firebase";

export function CustomLoginView(props: FirebaseLoginViewProps) {

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

    const submittedNewsletter = useRef(false);

    const authController = props.authController;
    useEffect(() => {
        if (newsletterSubscribed && authController.user?.email && !submittedNewsletter.current) {
            submittedNewsletter.current = true;
            handleSubmit(authController.user.email);
        }
    }, [newsletterSubscribed, authController.user]);

    return (
        <FirebaseLoginView
            {...props}
            disableSignupScreen={false}
            noUserComponent={<Alert>
                Sample custom message when no user exists
            </Alert>}
            disabled={!termsAccepted}
        >
            <>
                <Typography variant={"h5"} className={"mb-2"}>
                    FireCMS e-commerce and blog demo
                </Typography>

                <Typography className={"mb-4"} variant={"body2"}>
                    This is a demo application that showcases the capabilities of FireCMS.
                    Check the sample frontend application built with Next.js
                    in <a className={"inline"} href={"/products"} target={"_blank"} rel={"noreferrer"}>this link <OpenInNewIcon
                    className={"inline align-text-top"}
                    size={"smallest"}
                    /></a>.
                </Typography>

                {/*<Link*/}
                {/*    target={"_blank"}*/}
                {/*    href={"../products"}>*/}
                {/*    <Button size={"small"}*/}
                {/*            variant={"text"}*/}
                {/*            fullWidth*/}
                {/*            startIcon={<OpenInNewIcon/>}>See demo frontend app</Button>*/}
                {/*</Link>*/}

                <BooleanSwitchWithLabel size="small"
                                        invisible={true}
                                        value={newsletterSubscribed}
                                        onValueChange={setNewsletterSubscribed}
                                        position={"start"}
                                        label={
                                            <Typography variant={"caption"}>
                                                Join our newsletter. No spam, only important
                                                updates!
                                            </Typography>}/>
                <BooleanSwitchWithLabel size="small"
                                        invisible={true}
                                        value={termsAccepted}
                                        onValueChange={setTermsAccepted}
                                        position={"start"}
                                        label={
                                            <Typography variant={"caption"}>
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

        </FirebaseLoginView>
    );
}

const handleSubmit = (email: string) => {
    const url = "https://api-drplyi3b6q-ey.a.run.app/notifications/newsletter";
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email_address: email,
            source: "demo"
        })
    }).then((res) => {
        console.log("newsletter response", res);
    });
}
