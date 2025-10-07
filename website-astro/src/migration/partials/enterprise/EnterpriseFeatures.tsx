import React from "react";
import { ContainerMixin } from "../styles";
import { TwoColumns } from "../general/TwoColumns";
import { Panel } from "../general/Panel";
import AutoModeIcon from "@site/static/img/icons/auto_mode.svg";
import SettingsIcon from "@site/static/img/icons/settings.svg";
import CheckCircleIcon from "@site/static/img/icons/check_circle.svg";
import { PhoneFrame } from "../PhoneFrame";
import { BrowserFrame } from "../BrowserFrame";

export function EnterpriseFeatures() {
    return (
        <>

            <Panel color={"white"}>
                <div className={"flex items-center my-4 "}>
                    <h2 className={"m-0 text-3xl"}>Not just a CMS</h2>
                </div>

                <p className={"text-2xl "}>
                    FireCMS can be extended to
                    fit your needs. We can help you build a custom
                    admin panel that integrates with your infrastructure.
                    We believe in <strong>sensible
                    defaults</strong>, but we also
                    believe that you should be able to <strong>customize
                    your admin</strong> panel to fit your needs.
                </p>

                <div className="relative mx-auto mt-8">
                    <div className={"p-4 " + ContainerMixin}>
                        <div className="md:grid md:grid-cols-12 md:gap-4">
                            <div
                                className="max-w-7xl md:max-w-none md:w-full mx-auto md:col-span-9 md:pr-4 md:pr-8 flex justify-center flex-col h-full"
                            >
                                <BrowserFrame>
                                    <video
                                        style={{
                                            pointerEvents: "none",
                                            aspectRatio: 842 / 463,
                                        }}
                                        width="100%" loop autoPlay muted>
                                        <source
                                            src="/img/custom_entity_view.mp4"
                                            type="video/mp4"/>
                                    </video>
                                </BrowserFrame>
                            </div>

                            <div
                                className="md:w-full mx-auto md:col-span-3 md:order-1 my-16 md:my-0 flex justify-center flex-col h-full"
                            >
                                <PhoneFrame>
                                    <video
                                        style={{
                                            pointerEvents: "none",
                                            aspectRatio: 272 / 570,
                                            background: "white"
                                        }}
                                        className={"max-w-sm rounded-2xl"}
                                        width="100%" loop autoPlay
                                        muted>
                                        <source src="/img/tpa_app.mp4"
                                                type="video/mp4"/>
                                    </video>
                                </PhoneFrame>
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

            </Panel>

            {/*<Panel color={"white"}>*/}

            {/*    <TwoColumns*/}
            {/*        left={<>*/}

            {/*            <div className={"flex items-center my-4 mb-3 "}>*/}

            {/*                <h2 className={"m-0"}>Why Choose FireCMS?</h2>*/}

            {/*            </div>*/}


            {/*            <p className={"text-2xl "}>*/}
            {/*                Every organization has unique content management*/}
            {/*                requirements. We've designed FireCMS with flexibility*/}
            {/*                and customization in mind to cater to these diverse*/}
            {/*                needs.*/}
            {/*            </p>*/}

            {/*            <p className={"text-2xl "}>*/}
            {/*                Firebase offers exceptional scalability, making it an*/}
            {/*                ideal choice for companies aiming to build products that*/}
            {/*                can accommodate millions of users. With Firebase/Firestore, you*/}
            {/*                can focus on your product without concerns about*/}
            {/*                infrastructure limitations.*/}
            {/*            </p>*/}
            {/*        </>}*/}
            {/*        right={<>*/}
            {/*            <div className={"m-4 text-3xl"}>*/}
            {/*                <div className={"flex items-center gap-4"}>*/}
            {/*                    <CheckCircleIcon/>SSO integration*/}
            {/*                </div>*/}
            {/*                <div className={"flex items-center gap-4"}>*/}
            {/*                    <CheckCircleIcon/>Advanced data filtering*/}
            {/*                </div>*/}
            {/*                <div className={"flex items-center gap-4"}>*/}
            {/*                    <CheckCircleIcon/>Text search*/}
            {/*                </div>*/}
            {/*                <div className={"flex items-center gap-4"}>*/}
            {/*                    <CheckCircleIcon/>Support SLA*/}
            {/*                </div>*/}
            {/*                <div className={"flex items-center gap-4"}>*/}
            {/*                    <CheckCircleIcon/>Custom integrations*/}
            {/*                </div>*/}

            {/*            </div>*/}
            {/*        </>}/>*/}

            {/*</Panel>*/}

            {/*<section className={ContainerMixin + " my-8"}>*/}

            {/*    <h2 className={"h2"}>Perfect for apps</h2>*/}
            {/*    <p className={"text-2xl "}>*/}
            {/*        Firebase is an excellent fit for apps. It provides a great*/}
            {/*        developer experience and it is easy to integrate with*/}
            {/*        different platforms.*/}
            {/*    </p>*/}


            {/*</section>*/}

        </>
    );
}
