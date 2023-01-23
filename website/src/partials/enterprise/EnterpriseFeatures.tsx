import React from "react";
import { ContainerMixin } from "../utils";
import { TwoColumns } from "../general/TwoColumns";
import { lightningIcon } from "../icons";
import { Panel } from "../general/Panel";
import RecentPatient from "@site/static/img/icons/recent_patient.svg";
import SettingsIcon from "@site/static/img/icons/settings.svg";
import CheckCircleIcon from "@site/static/img/icons/check_circle.svg";

export function EnterpriseFeatures() {
    return (
        <>

            <Panel color={"gray"}>
                <div className={"text-xl font-bold"}>
                    <p>
                        FireCMS was developed in conjunction with different
                        companies, out of the need to have a CMS that could be
                        used in different scenarios and that could be easily
                        customized to fit different needs.
                    </p>
                </div>
            </Panel>

            <TwoColumns
                left={<>

                    <div className={"flex items-center my-4 "}>

                        <div
                            className="flex items-center justify-center text-white w-8 h-8 bg-gray-800 rounded-full shadow flex-shrink-0 mr-3">
                            <RecentPatient width={"20px"} height={"20px"}/>
                        </div>
                        <h2 className={"h2 m-0"}>Enterprise ready</h2>

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
                            <CheckCircleIcon/>Premium integrations like SSO
                        </div>
                        <div className={"flex items-center gap-4"}>
                            <CheckCircleIcon/>Advanced data filtering and text search
                        </div>
                        <div className={"flex items-center gap-4"}>
                            <CheckCircleIcon/>Support SLA
                        </div>
                        <div className={"flex items-center gap-4"}>
                            <CheckCircleIcon/>Dedicated support
                        </div>

                    </div>
                </>}/>

            <TwoColumns
                left={<>
                </>}
                right={<>
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
                        your admin</strong>
                        panel to fit your needs.
                    </p>
                    <p>
                        When managing your data you need to be able to
                        ensure consistency and security. FireCMS provides a set
                        of tools
                        that will help you achieve that.
                    </p>
                    <p>
                        FireCMS is a fully extendable app that will
                        become the heart of your project.

                    </p>
                </>}/>

            <section className={ContainerMixin + " my-8"}>

                <h2 className={"h2"}>Perfect for apps</h2>
                <p className={"text-xl "}>
                    Firebase is an excellent fit for apps. It provides a great
                    developer experience and it is easy to integrate with
                    different platforms.
                </p>


            </section>

            <TwoColumns left={<>
                <div className={"flex items-center mb-3 "}>

                    <div
                        className="flex items-center justify-center text-white w-8 h-8 bg-gray-800 rounded-full shadow flex-shrink-0 mr-3">
                        {lightningIcon}
                    </div>

                    <h3 className="h3 m-0">
                        For new projects
                    </h3>

                </div>
            </>} right={<>
                <div className={"flex items-center mb-3 "}>

                    <div
                        className="flex items-center justify-center text-white w-8 h-8 bg-gray-800 rounded-full shadow flex-shrink-0 mr-3">
                        {lightningIcon}
                    </div>

                    <h3 className="h3 m-0">
                        For existing projects
                    </h3>

                </div>
            </>}/>
        </>
    );
}
