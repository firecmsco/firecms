import { Typography } from "@firecms/ui";

export function StripeDisclaimer() {
    return <Typography variant={"caption"} className={"mt-4"}>
        You will be redirected to <b>Stripe</b> to manage the subscription.
        You will be charged every month per the maximum concurrent of users.
        You can cancel your subscription at any time, and enjoy the benefits
        until the end of the current billing period.
    </Typography>;
}
