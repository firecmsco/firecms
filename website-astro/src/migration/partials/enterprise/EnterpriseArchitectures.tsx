import React from "react";
import { TwoColumns } from "../general/TwoColumns";
import { Panel } from "../general/Panel";
import SimpleArchitecture from "@site/static/img/enterprise/simple_architecture.svg";
import ComplexArchitecture from "@site/static/img/enterprise/complex_architecture.svg";

export function EnterpriseArchitectures() {
    return (
        <>


            <Panel color={"dark_gray"} includePadding={false}>
                <TwoColumns
                    left={<div className={"text-2xl pr-8"}>

                        <h2 className={"h2 font-mono"}>Adaptable to Your Architecture</h2>
                        <p>
                            Our team has developed comprehensive solutions for
                            numerous successful companies and gained expertise in
                            various architectures.
                        </p>
                        <p>
                            FireCMS can be integrated into your
                            existing architecture, or we can help you develop a new
                            one.
                        </p>
                        <p>
                            Your data and services will be hosted in your own
                            own backend (Firebase, MongoDB Atlas or any other), allowing you to implement your own
                            authentication and authorization system.
                        </p>

                        <p>
                            As a headless CMS, FireCMS is compatible with <b>any
                            frontend framework</b> and is not limited to a specific
                            rendering layer, unlike traditional CMSs.

                        </p>

                    </div>}
                    right={<div className={"p-8 flex flex-col"}>
                        <SimpleArchitecture className={"w-full mt-8"}/>
                        <label className={"text-sm text-center m-4"}>Simple
                            architecture</label>
                        <ComplexArchitecture className={"w-full mt-16"}/>
                        <label className={"text-sm text-center m-4"}>Architecture
                            using microservices</label>
                    </div>
                    }/>
            </Panel>

            <Panel color={"primary"} centered={true}>
                <h2 className="mb-4 uppercase font-mono">
                    Open source is the path to success
                </h2>
            </Panel>
        </>
    );
}
