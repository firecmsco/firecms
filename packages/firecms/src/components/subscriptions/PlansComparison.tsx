import React from "react";
import { useNavigationController } from "@firecms/core";
import { Button, CloseIcon, Container, Dialog, DialogContent, IconButton, } from "@firecms/ui";
import { useNavigate } from "react-router-dom";
import { UpgradeToPlusButton } from "./UpgradeToPlusButton";

export function PlansComparisonDialog({
                                          open,
                                          onClose,
                                      }: {
    open: boolean,
    onClose: () => void
}) {

    const navigationController = useNavigationController();
    const navigate = useNavigate();
    const goToSettings = () => {
        onClose();
        navigate(navigationController.basePath + "/settings");
    }

    return <Dialog
        fullScreen={true}
        open={open}
        onOpenChange={(open) => !open ? onClose() : undefined}
    >
        <DialogContent fullHeight={true}>
            <PlansComparison/>
        </DialogContent>
        <IconButton className={"absolute top-4 right-4"}
                    onClick={onClose}>
            <CloseIcon/>
        </IconButton>
    </Dialog>;
}

export function PlansComparison() {

    const freeTier = (
        <div
            className="h-full max-w-sm p-6 border border-solid border-gray-200 rounded-lg shadow dark:border-gray-700 flex flex-col">

            <h3 className={"text-2xl md:text-4xl font-bold text-center text-gray-700 dark:text-gray-300 uppercase my-4"}>
                Free
            </h3>
            <div className={"grow"}>
                <p className={"text-lg mb-4"}>
                    Try FireCMS and upgrade to a paid plan when you
                    need more features.
                </p>
                <ul>
                    <li className={"ml-8 list-disc"}>Unlimited projects</li>
                    <li className={"ml-8 list-disc"}>Unlimited collections</li>
                    <li className={"ml-8 list-disc"}>All available form fields</li>
                    <li className={"ml-8 list-disc"}>Schema editor and data inference</li>
                    <li className={"ml-8 list-disc"}>Advanced data import and export</li>
                    <li className={"ml-8 list-disc"}>Default roles</li>
                    <li className={"ml-8 list-disc"}>3 users</li>
                </ul>
            </div>
            <div className={"text-center mt-4 text-gray-600 dark:text-gray-400 w-full"}>
                <span className={"text-2xl font-bold "}>€0 user/month</span>
            </div>

        </div>
    );

    const plusTier = (
        <div
            className="h-full max-w-sm p-6 rounded-lg flex flex-col outline-none ring-2 ring-primary ring-opacity-75 ring-offset-2 ring-offset-transparent">

            <h3 className={"text-2xl md:text-4xl font-bold text-center dark:text-primary text-primary uppercase my-4"}>
                Plus
            </h3>
            <div className={"grow"}>
                <p className={"text-lg mb-4"}>
                    Perfect for startups and larger companies
                </p>
                <ul>
                    <li className={"ml-8 list-disc"}>Everything in the free tier</li>
                    <li className={"ml-8 list-disc"}>Local text search</li>
                    <li className={"ml-8 list-disc"}>Custom fields and custom views</li>
                    <li className={"ml-8 list-disc"}>Unlimited users and roles</li>
                    <li className={"ml-8 list-disc"}>Unlimited data export</li>
                    <li className={"ml-8 list-disc"}>Theme and logo customization</li>
                    <li className={"ml-8 list-disc"}>Custom user roles</li>
                    <li className={"ml-8 list-disc"}>GPT-4 content generation</li>
                </ul>
            </div>

            <div className={"flex flex-col gap-4 items-center justify-center mt-8"}>
                <UpgradeToPlusButton includePriceSelect={true}
                                     includePriceLabel={false}
                                     largePriceLabel={true}/>
            </div>

        </div>
    );

    const proTier = (
        <div
            className="h-full max-w-sm p-6 border border-solid border-gray-200 rounded-lg shadow dark:border-gray-700 flex flex-col">

            <h3 className={"text-2xl md:text-4xl font-bold text-center text-gray-700 dark:text-gray-300 uppercase my-4"}>
                Pro
            </h3>
            <div className={"grow"}>
                <p className={"text-lg mb-4"}>
                    Perfect for agencies.
                </p>
                <ul>
                    <li className={"ml-8 list-disc"}>Everything in PLUS</li>
                    <li className={"ml-8 list-disc"}>Self-hosted</li>
                    <li className={"ml-8 list-disc"}>SAML SSO</li>
                    <li className={"ml-8 list-disc"}>Custom domain</li>
                    <li className={"ml-8 list-disc"}>Full CMS components customization</li>
                    <li className={"ml-8 list-disc"}>Priority support</li>
                    <li className={"ml-8 list-disc"}>Roadmap prioritization</li>
                </ul>
            </div>
            <div className={"text-center mt-4 text-primary w-full"}>
                <Button
                    component={"a"}
                    size={"large"}
                    variant={"outlined"}
                    href="https://firecms.co/pro"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    More info
                </Button>
            </div>

        </div>
    );

    return <div className={"overflow-auto my-auto"}>
        <Container className={"flex flex-col gap-4 p-8 m-auto"}>

            <h2 className={"text-3xl md:text-4xl font-bold my-4 text-center"}>
                Full no-code/low-code solution
            </h2>

            <p>
                <strong>FireCMS Cloud</strong> offers a complete, end-to-end
                solution for businesses that require the highest level of
                support and security. With dedicated hosting, advanced features, and
                expert support, you will have everything you need to take your project
                to the next level.
            </p>

            {/*three columns layout*/}
            <div
                className="flex flex-col items-center lg:grid lg:grid-cols-3 gap-4 mt-8 w-full mx-auto"
            >
                {freeTier}
                {plusTier}
                {proTier}
            </div>

        </Container>
    </div>;

}
