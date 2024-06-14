import React from "react";
import Layout from "@theme/Layout";
import { Hero } from "../partials/general/Hero";
import { Panel } from "../partials/general/Panel";
import { CTACaret, CTAOutlinedButtonMixin, CTAOutlinedButtonWhiteMixin } from "../partials/styles";
import { DocsIconsView } from "../partials/DocsIconsView";
import { UIComponentsShowcase } from "../partials/ui/UIComponentsShowcase";

const UIPage: React.FC = () => {
    return (
        <Layout title="FireCMS UI, batteries included">

            <Hero
                color={"secondary"}
                title={
                    <>
                        <span className="block lg:inline">FireCMS UI</span>
                    </>}
                subtitle={
                    <>
                        <p>
                            FireCMS includes a set of components based on <b>tailwind</b> and <b>RadixUI</b> that can be
                            used in any React project.
                        </p>
                    </>}
                subtitleColor={"dark_gray"}
                cta={
                    <a
                        className={CTAOutlinedButtonWhiteMixin + " w-full lg:w-auto "}
                        href={"/docs/components"}
                        rel="noopener noreferrer"
                    >
                        Check the docs
                        <CTACaret/>
                    </a>}
            />

            <Panel color={"transparent"}>
                <UIComponentsShowcase/>
            </Panel>

            <Panel color={"light"} className={"dark:bg-gray-800 dark:text-white text-lg"}>

                <h2 className={"text-3xl md:text-4xl font-bold my-2"}>
                    A solid foundation
                </h2>
                <p>
                    You can use any of the <b>components</b> that power FireCMS, in your FireCMS apps or in any project.
                </p>
                <p>
                    These components provide a <b>consistent look and feel</b>, and are designed to be easily
                    customizable.
                    Enjoy the best parts of <b>tailwind and RadixUI</b>, with a focus on accessibility and dark mode
                    support,
                    and an API that is easy to use and understand, inspired by Material UI.
                </p>
                <div
                    className="mt-5 sm:mt-8">

                    <a
                        className={CTAOutlinedButtonMixin + " w-full lg:w-auto "}
                        href={"/docs/components"}
                        rel="noopener noreferrer"
                    >
                        Check the docs
                        <CTACaret/>
                    </a>
                </div>
            </Panel>
            <Panel color={"lighter"} className={"dark:bg-gray-800 dark:text-white text-lg"}>

                <h2 className={"text-3xl md:text-4xl font-bold my-2"}>
                    Do you need icons?
                </h2>
                <p>
                    FireCMS UI bundles all <b>Material icons</b>, conveniently exported as individual components
                </p>
                <DocsIconsView/>
            </Panel>

        </Layout>
    );
};

export default UIPage;
