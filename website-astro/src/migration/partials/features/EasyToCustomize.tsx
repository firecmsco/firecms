import React from "react";

import { TwoColumns } from "../general/TwoColumns";
import { defaultBorderMixin } from "../styles";
import clsx from "clsx";
import { Panel } from "../general/Panel";

function EasyToCustomize() {

    
    const isDarkTheme = true;

    return (
        <>

            <Panel color={"lighter"}>
                <TwoColumns
                    reverseSmall={false}
                    right={<div>
                        <div className="relative flex flex-col">
                            <video
                                className={clsx("pointer-events-none rounded-2xl border", defaultBorderMixin)}
                                style={{
                                    maxWidth: 540,
                                    aspectRatio: 540 / 515
                                }}
                                width="100%" loop autoPlay muted>
                                <source
                                    src={"/img/custom_fields_dark.mp4"}
                                    type="video/mp4"/>
                            </video>
                        </div>
                    </div>}
                    left={
                        <div>

                            <div
                                className={"flex items-center mb-3"}>

                                <h3 className="m-0 ">
                                    Easy to customise
                                </h3>

                            </div>

                            <p className="text-xl md:text-2xl ">
                                FireCMS offers an easy way to adapt the
                                platform to their specific needs while keeping the <b>initial setup simple</b>. Our
                                practical defaults can be conveniently <b>overridden or expanded</b>.
                            </p>
                            <p className="text-xl ">
                                Effortlessly integrate your custom form fields as
                                React components and preview widgets. Moreover, you
                                can create detailed views related to your entities
                                or within the main navigation for a truly customized
                                experience.
                            </p>

                            <p className="text-xl ">
                                You could add:
                                <li> A <b>dashboard</b></li>
                                <li> A <b>preview</b> of the blog article you are
                                    writing
                                </li>
                                <li> A representation of how the content is
                                    going to look like in your <b>app or website</b>.
                                </li>
                                <li> And <b>anything</b> you can imagine.</li>
                            </p>

                        </div>
                    }
                />
            </Panel>
        </>
    );
}

export default EasyToCustomize;
