import { useEffect, useRef, useState } from "react";
import { Alert, BooleanSwitchWithLabel, Typography } from "@firecms/ui";
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
            additionalComponent={
                <>
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
            }
        />
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
