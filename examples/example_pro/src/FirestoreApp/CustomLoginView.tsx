import { useEffect, useRef, useState } from "react";
import { Alert, Checkbox, Label, Typography } from "@firecms/ui";
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
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="newsletter-checkbox"
                            checked={newsletterSubscribed}
                            onCheckedChange={setNewsletterSubscribed}
                            size="small"
                        />
                        <Label htmlFor="newsletter-checkbox">
                            <Typography variant={"caption"}>
                                Join our newsletter. No spam, only important
                                updates!
                            </Typography>
                        </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="terms-checkbox"
                            checked={termsAccepted}
                            onCheckedChange={setTermsAccepted}
                            size="small"
                        />
                        <Label htmlFor="terms-checkbox">
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
                        </Label>
                    </div>
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
