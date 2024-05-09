import React from "react";
import { TwoColumns } from "../general/TwoColumns";
import { Panel } from "../general/Panel";
import AutoModeIcon from "@site/static/img/icons/auto_mode.svg";
import CheckCircleIcon from "@site/static/img/icons/check_circle.svg";

export function Features() {
    return (
        <>
            <Panel color={"white"}>

                <TwoColumns
                    left={<>

                      <div className={"flex items-center my-4 "}>

                        <div
                          className="flex items-center justify-center text-white w-10 h-10 gradient-bg rounded-full shadow flex-shrink-0 mr-3">
                          <AutoModeIcon width={"20px"} height={"20px"}/>
                        </div>
                        <h2 className={"h2 m-0"}>Why Choose DataTalk?</h2>

                      </div>


                      <p className={"text-2xl "}>
                        Secure, using the latest encryption technologies. In the transport, with TLS/SSL and storing
                        your metadata with AES.
                      </p>

                      <p className={"text-2xl "}>
                        Faster than any LLM, optimized to provide the best performance for your queries.
                      </p>

                      <p className={"text-2xl "}>
                        Safe. Only for admins and users with the right permissions.
                      </p>

                      <p className={"text-2xl "}>
                        Private, you are using your own data, we don't store it. All the queries are sandboxed and done
                        in real time with you on the watch.
                      </p>

                    </>}
                    right={<>
                      <div className={"m-4 text-3xl"}>
                        <div className={"flex items-center gap-4"}>
                          <CheckCircleIcon/>Secure
                            </div>
                            <div className={"flex items-center gap-4"}>
                                <CheckCircleIcon/>Fast
                            </div>
                            <div className={"flex items-center gap-4"}>
                                <CheckCircleIcon/>Safe
                            </div>
                            <div className={"flex items-center gap-4"}>
                                <CheckCircleIcon/>Private
                            </div>
                            <div className={"flex items-center gap-4"}>
                                <CheckCircleIcon/>Reliable
                            </div>

                        </div>
                    </>}/>

            </Panel>


        </>
    );
}
