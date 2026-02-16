import { Typography } from "@firecms/ui";

export function StripeDisclaimer() {
    return <Typography variant={"caption"} className={"mt-4"}>
        You will be redirected to <b>Stripe</b> to complete your subscription.
        Billed monthly based on your maximum users this month.
        Cancel anytime - you&apos;ve already paid for the current billing period,
        so no additional charges after cancellation.
    </Typography>;
}

