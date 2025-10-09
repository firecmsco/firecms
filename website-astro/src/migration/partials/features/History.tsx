import React from "react";

import { defaultBorderMixin } from "../styles";
import { Panel } from "../general/Panel";
import { TwoColumns } from "../general/TwoColumns";

import clsx from "clsx";

function History() {


    const isDarkTheme = true;

    return (
        <Panel color={"light"}>

            <TwoColumns
                left={
                    <div>

                        <p className="text-secondary uppercase font-bold font-mono">
                            Solid foundation
                        </p>


                        <div className={"flex items-center mb-4"}>
                            <div
                                className="flex items-center justify-center text-white w-10 h-10 bg-gray-900 rounded-full shadow flex-shrink-0 mr-4">
                                <img src="/img/icons/magic.svg" alt="magic" className="w-6 h-6"/>
                            </div>

                            <h2 className="m-0">
                                <span>Changes </span>
                                <span className="text-primary">History</span>
                            </h2>
                        </div>

                        <div className="mt-3 text-xl sm:mt-4 md:text-2xl">
                            <p>
                                FireCMS provides a comprehensive
                                changes history feature that allows you to
                                track all modifications made to your data.
                            </p>
                            <p>
                                This feature is essential for maintaining data integrity and
                                ensuring that you can always revert to a previous state if needed.
                            </p>
                        </div>

                    </div>
                }
                right={<>

                    <div
                        style={{
                            aspectRatio: 550 / 692,
                            maxHeight: "692px",
                            maxWidth: "550px"
                        }}
                        data-aos="fade-up"
                        className={" flex content-center justify-center"}>
                        <img
                            key={isDarkTheme ? "dark" : "light"}
                            className={clsx("pointer-events-none rounded-2xl border", defaultBorderMixin)}
                            width="100%"
                            src={'/img/history.png'}
                            alt="history"/>
                    </div>


                </>}/>
        </Panel>
    );
}

export default History;
