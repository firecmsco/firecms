import React from "react";
import { TwoColumns } from "../general/TwoColumns";
import { Panel } from "../general/Panel";
import SimpleArchitecture
    from "@site/static/img/enterprise/simple_architecture.svg";
import ComplexArchitecture
    from "@site/static/img/enterprise/complex_architecture.svg";

export function EnterpriseArchitectures() {
    return (
        <>

            <Panel color={"secondary"} centered={true}>
                <h4 className="h1 mb-4 uppercase">
                    Open source is the path to success
                </h4>
            </Panel>

            <TwoColumns
                left={<div className={"text-2xl "}>


                    <h2 className={"h2"}>Adaptable to Your Architecture</h2>
                    <p>
                        Our team has developed comprehensive solutions for
                        numerous successful companies and gained expertise in
                        various architectures. We can assist you in building a
                        scalable infrastructure.

                    </p>
                    <p>
                        Firebase and FireCMS can be integrated into your
                        existing architecture, or we can help you develop a new
                        one.

                    </p>
                    <p>
                        Your data and services will be hosted in your own
                        Firebase project, allowing you to implement your own
                        authentication and authorization system.

                    </p>

                    <p>
                        As a headless CMS, FireCMS is compatible with <b>any
                        frontend framework</b> and is not limited to a specific
                        rendering layer, unlike traditional CMSs.

                    </p>

                </div>}
                right={<>
                    <SimpleArchitecture className={"w-full mt-8"}/>
                    <label className={"text-sm text-center m-4"}>Simple
                        architecture</label>
                    <ComplexArchitecture className={"w-full mt-16"}/>
                    <label className={"text-sm text-center m-4"}>Architecture
                        using microservices</label>
                </>
                }/>

        </>
    );
}
