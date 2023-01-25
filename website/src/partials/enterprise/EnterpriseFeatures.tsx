import React from "react";
import { ContainerMixin, ContainerSmallMixin } from "../utils";
import { TwoColumns } from "../general/TwoColumns";
import { lightningIcon } from "../icons";
import { Panel } from "../general/Panel";
import AutoModeIcon from "@site/static/img/icons/auto_mode.svg";
import SettingsIcon from "@site/static/img/icons/settings.svg";
import CheckCircleIcon from "@site/static/img/icons/check_circle.svg";

export function EnterpriseFeatures() {
    return (
        <>


            <TwoColumns
                left={<>

                    <div className={"flex items-center my-4 "}>

                        <div
                            className="flex items-center justify-center text-white w-8 h-8 bg-gray-800 rounded-full shadow flex-shrink-0 mr-3">
                            <AutoModeIcon width={"20px"} height={"20px"}/>
                        </div>
                        <h2 className={"h2 m-0"}>Why FireCMS?</h2>

                    </div>


                    <p className={"text-xl "}>
                        Every company needs to manage content in different ways.
                        We
                        have built FireCMS to be flexible and to be able to
                        adapt to
                        different scenarios.
                    </p>

                    <p>
                        Firestore provides a degree of scalability that is hard
                        to
                        find in other platforms. It is a great fit for companies
                        that are looking to build a product that can scale to
                        millions of users. Without the need to worry about the
                        infrastructure.
                    </p>
                </>}
                right={<>
                    <div className={"my-4 text-2xl"}>
                        <div className={"flex items-center gap-4"}>
                            <CheckCircleIcon/>SSO integration
                        </div>
                        <div className={"flex items-center gap-4"}>
                            <CheckCircleIcon/>Advanced data filtering and text
                            search
                        </div>
                        <div className={"flex items-center gap-4"}>
                            <CheckCircleIcon/>Support SLA
                        </div>
                        <div className={"flex items-center gap-4"}>
                            <CheckCircleIcon/>Custom integrations
                        </div>
                        <div className={"flex items-center gap-4"}>
                            <CheckCircleIcon/>Dedicated support
                        </div>

                    </div>
                </>}/>

            <Panel color={"gray"} includeMargin={true}>
                <div className={"text-xl"}>
                    <p>
                        FireCMS was developed in conjunction with <strong>different
                        companies</strong>, out of the need to have a CMS that
                        could be
                        used in <strong>different scenarios</strong> and that
                        could be easily
                        customized to fit different needs.
                    </p>
                </div>
            </Panel>

            <section className={ContainerMixin + " my-16"}>
                <div className={"flex items-center my-4 "}>

                    <div
                        className="flex items-center justify-center text-white w-8 h-8 bg-gray-800 rounded-full shadow flex-shrink-0 mr-3">
                        <SettingsIcon width={"20px"} height={"20px"}/>
                    </div>
                    <h2 className={"h2 m-0"}>Not just a CMS</h2>

                </div>

                <p className={"text-xl "}>
                    FireCMS can be extended to
                    fit your needs. We can help you build a custom
                    admin panel that integrates with your infrastructure.
                    At FireCMS, we believe in <strong>sensible
                    defaults</strong>, but we also
                    believe that you should be able to <strong>customize
                    your admin</strong> panel to fit your needs.
                </p>


                <div className="relative mx-auto mt-16">
                    <div className={"p-4 " + ContainerMixin}>
                        <div className="md:grid md:grid-cols-12 md:gap-4">
                            <div
                                className="max-w-7xl md:max-w-none md:w-full mx-auto md:col-span-9 md:pr-4 md:pr-8 flex justify-center flex-col h-full"
                                data-aos="fade-right"
                            >
                                <video
                                    style={{
                                        aspectRatio: 842 / 463,
                                    }}
                                    className={"rounded-xl border border-solid dark:border-gray-800 border-gray-200"}
                                    width="100%" loop autoPlay muted>
                                    <source src="/img/custom_entity_view.mp4"
                                            type="video/mp4"/>
                                </video>
                            </div>

                            <div
                                className="md:w-full mx-auto md:col-span-3 md:order-1 my-16 md:my-0 flex justify-center flex-col h-full"
                                data-aos="fade-left"
                            >
                                <div className="relative w-72 mx-auto">
                                    <div
                                        className="h-6 w-0.5 rounded-l-sm bg-black absolute -left-0.5 top-16"></div>
                                    <div
                                        className="h-8 w-0.5 rounded-l-sm bg-black absolute -left-0.5 top-28"></div>
                                    <div
                                        className="h-8 w-0.5 rounded-l-sm bg-black absolute -left-0.5 top-40"></div>
                                    <div
                                        className="h-auto w-72 bg-black rounded-3xl p-.5 overflow-hidden">
                                        <div
                                            className="h-full w-full bg-black rounded-4xl overflow-hidden p-2 relative">
                                            <div
                                                className="w-8 h-4 bg-black absolute left-1/2 rounded-b-2xl transform -translate-x-1/2"></div>
                                            <video
                                                style={{
                                                    aspectRatio: 272 / 570,
                                                    background: "white"
                                                }}
                                                className={"max-w-sm rounded-2xl"}
                                                width="100%" loop autoPlay
                                                muted>
                                                <source src="/img/tpa_app.mp4"
                                                        type="video/mp4"/>
                                            </video>
                                        </div>
                                    </div>
                                    <div
                                        className="h-14 w-0.5 rounded-l-sm bg-black absolute -right-0.5 top-32"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/*<div*/}
                {/*    className={ContainerSmallMixin + ""}>*/}
                {/*    <div className="flex items-center justify-center">*/}
                {/*        */}
                {/*    </div>*/}

                {/*</div>*/}

            </section>

            {/*<section className={ContainerMixin + " my-8"}>*/}

            {/*    <h2 className={"h2"}>Perfect for apps</h2>*/}
            {/*    <p className={"text-xl "}>*/}
            {/*        Firebase is an excellent fit for apps. It provides a great*/}
            {/*        developer experience and it is easy to integrate with*/}
            {/*        different platforms.*/}
            {/*    </p>*/}


            {/*</section>*/}

        </>
    );
}
