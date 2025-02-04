import React from "react";
import Layout from "@theme/Layout";
import { Hero } from "../partials/general/Hero";
import { Panel } from "../partials/general/Panel";
import { CTACaret, CTAOutlinedButtonMixin, CTAOutlinedButtonWhiteMixin } from "../partials/styles";
import { DocsIconsView } from "../partials/DocsIconsView";
import { UIComponentsShowcase } from "../partials/ui/UIComponentsShowcase";
// import { clarityScript } from "../partials/clarity_head";
import Head from "@docusaurus/Head";

const UIPage: React.FC = () => {
    return (
        <Layout title="FireCMS UI, batteries included"
                description={"A complete UI kit to develop apps in no time"}>
            <Head>
                <meta property="og:title" content="FireCMS UI, batteries included"/>
                <meta property="og:description"
                      content="A complete UI kit to develop apps in no time"/>
                <meta property="og:image" content="/img/firecms_logo.svg"/>
                {/*<script type="text/javascript">*/}
                {/*    {clarityScript}*/}
                {/*</script>*/}
            </Head>
            <Hero
                title={
                    <>
                        <span className="block lg:inline">FireCMS UI</span>
                    </>}
                subtitle={
                    <>
                        <p>
                            A battle-tested set of components based on <b>tailwind</b> and <b>RadixUI</b> that can be
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

            <Panel color={"light"} container={true} className={"dark:bg-gray-800 dark:text-white text-lg"}>

                <h2 className={"text-3xl md:text-4xl font-bold my-2"}>
                    A solid foundation
                </h2>
                <p>
                    FireCMS UI is a UI kit based on <b>React</b>, <b>tailwind</b> and <b>RadixUI</b>, with a focus
                    on <b>accessibility</b> and <b>simplicity</b>.
                    The defaults look great out of the box, but are easy to customize.
                </p>
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
                <p>
                    FireCMS UI merges the best of both worlds, providing a set of components that are easy to use and
                    customize, while being <b>accessible</b> and <b>beautiful</b>.
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
            <Panel container={true} color={"lighter"} className={"dark:bg-gray-800 dark:text-white text-lg"}>

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
