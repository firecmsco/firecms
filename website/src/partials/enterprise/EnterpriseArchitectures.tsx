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
                left={<>

                    <h2 className={"h2"}>It fits your architecture</h2>
                    <p className={"text-xl "}>
                        Every company needs to manage content in different ways.
                    </p>

                    <p>
                        We have developed the full stack for multiple
                        successful companies. We have experience with different
                        architectures and we can help you build a scalable
                        infrastructure.
                    </p>
                    <p>
                        You can fit Firebase and FireCMS to your existing
                        architecture or we can help you build a new one.
                    </p>
                    <p>
                        All the data and services are hosted in your own
                        Firebase
                        project. You can use your own authentication and
                        authorization system.
                    </p>

                    <p>
                        FireCMS is a headless CMS, which means that it can be
                        used
                        with <b>any frontend framework</b>. Unlike traditional
                        CMSs, it
                        is not coupled to the rendering layer.
                    </p>

                </>}
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
