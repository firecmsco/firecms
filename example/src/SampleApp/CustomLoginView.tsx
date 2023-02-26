import { useEffect, useRef, useState } from "react";
import { FirebaseLoginView, FirebaseLoginViewProps } from "firecms";
import { FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";

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
            noUserComponent={<>
                Sample custom message when no user exists
            </>}
            disabled={!termsAccepted}
            additionalComponent={
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Switch size="small"
                                    value={newsletterSubscribed}
                                    onChange={
                                        (event: React.ChangeEvent<HTMLInputElement>) => {
                                            setNewsletterSubscribed(event.target.checked);
                                        }}/>
                        }
                        label={
                            <Typography variant={"caption"}>
                                Join our newsletter. No spam, only important
                                updates!
                            </Typography>}/>
                    <FormControlLabel
                        control={
                            <Switch size="small"
                                    value={termsAccepted}
                                    onChange={
                                        (event: React.ChangeEvent<HTMLInputElement>) => {
                                            setTermsAccepted(event.target.checked);
                                        }}/>
                        }
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
                </FormGroup>
            }
        />
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
            source: "demo"
        })
    }).then((res) => {
        console.log("newsletter response", res);
    });
}
