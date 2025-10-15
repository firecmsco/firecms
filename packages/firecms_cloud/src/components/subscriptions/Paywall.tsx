import React from "react";
import { FireCMSLogo } from "@firecms/core";
import {
    CenteredView,
    CloseIcon,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    LoadingButton,
    RocketLaunchIcon,
    Typography
} from "@firecms/ui";

import { UpgradeCloudSubscriptionView } from "./UpgradeCloudSubscriptionView";
import { useProjectConfig, useSubscriptionsForUserController } from "../../hooks";

export function PaywallDialog({
                                  open,
                                  trialOver,
                                  onClose,
                              }: {
    open: boolean,
    trialOver: boolean,
    onClose: () => void
}) {

    return <Dialog
        // fullScreen={true}
        maxWidth={"2xl"}
        open={open}
        onOpenChange={(open) => !open ? onClose() : undefined}
    >

        <DialogTitle hidden>Plans comparison</DialogTitle>
        <DialogContent>
            <Paywall trialOver={trialOver}/>
        </DialogContent>
        <IconButton className={"absolute top-4 right-4"}
                    onClick={onClose}>
            <CloseIcon/>
        </IconButton>
    </Dialog>;
}

export function Paywall({ trialOver }: {
    trialOver: boolean
}) {

    return <CenteredView className={"overflow-auto my-auto"}>
        <Container
            maxWidth={"xl"}
            className={"flex flex-col gap-4 p-8 m-auto"}>

            <FireCMSLogo width={"64px"}/>

            {trialOver && <Typography variant={"h3"}>
                Your free trial is over
            </Typography>}

            {!trialOver && <Typography variant={"h3"}>
                Subscribe now
            </Typography>}

            <Typography variant={"body1"}>
                Please create a subscription to continue using the service after your free trial ends, to avoid any
                service interruptions.
            </Typography>

            <Typography variant={"caption"}>
                If you need help, don&apos;t hesitate to reach us at <a
                href="mailto:hello@firecms.co?subject=Subscription%20help"
                rel="noopener noreferrer"
                target="_blank">
                hello@firecms.co </a>, or in our <a
                rel="noopener noreferrer"
                target="_blank"
                href={"https://discord.gg/fxy7xsQm3m"}>Discord channel</a>.
            </Typography>

            <div className={"flex flex-row gap-4 mt-8"}>
                <UpgradeButton/>
            </div>


        </Container>
    </CenteredView>;

}

function UpgradeButton() {
    const {
        subscriptionPlan,
        projectId
    } = useProjectConfig();

    if (!subscriptionPlan)
        throw new Error("No subscription plan");

    const {
        products,
    } = useSubscriptionsForUserController();

    const plusProduct = products?.find(p => p.metadata?.type === "cloud_plus");

    if (!plusProduct) {
        return <LoadingButton
            variant={"filled"}
            color={"primary"}
            loading={true}
            startIcon={<RocketLaunchIcon/>}>
            Create a subscription
        </LoadingButton>
    }

    return <UpgradeCloudSubscriptionView
        includePriceSelect={true}
        largePriceLabel={true}
        product={plusProduct}
        projectId={projectId}/>
}
