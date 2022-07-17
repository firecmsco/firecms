import { useEffect, useRef, useState } from "react";
import { FirebaseLoginView, FirebaseLoginViewProps } from "@camberi/firecms";
import { FormControlLabel, FormGroup, Switch, Typography } from "@mui/material";

export function CustomLoginView(props: FirebaseLoginViewProps) {

    const [termsAccepted, setTermsAccepted] = useState(false);
    const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

    const submittedNewsletter = useRef(false);

    const authDelegate = props.authDelegate;
    useEffect(() => {
        if (newsletterSubscribed && authDelegate.user?.email && !submittedNewsletter.current) {
            submittedNewsletter.current = true;
            handleSubmit(authDelegate.user.email);
        }
    }, [newsletterSubscribed, authDelegate.user]);

    return (
        <FirebaseLoginView
            {...props}
            disableSignupScreen={false}
            NoUserComponent={<>
                Sample custom message when no user exists
            </>}
            disabled={!termsAccepted}
            AdditionalComponent={
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
                                href={"https://firecms.co/terms_conditions"}>
                                Terms and Conditions</a>
                            </Typography>
                        }/>
                </FormGroup>
            }
        />
    );
}


const handleSubmit = (email: string) => {
    fetch("https://europe-west3-firecms-demo-27150.cloudfunctions.net/api/sign_up_newsletter", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "email_address": email,
            "source": "demo"
        })
    }).then((res) => {
        console.log("newsletter response", res);
    });
}
