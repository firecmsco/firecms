import React from "react";
import { Panel } from "../general/Panel";
import { CTACaret, CTAOutlinedButtonWhiteMixin } from "../styles";
import clsx from "clsx";
import { LazyVideo } from "../LazyVideo";

function DatakiIntro() {
    return (
        <Panel color={"dark_gray"}>
            <div className={"flex flex-col lg:flex-row items-center justify-center"}>
                <div
                    className="lg:w-1/2 text-center m-8">
                    <p
                        className={clsx("text-center text-secondary uppercase font-mono font-bold")}>
                        Beyond content management
                    </p>
                    <h2 className="text-3xl md:text-5xl mb-4  mx-auto uppercase"
                        data-aos="zoom-y-out">
                        Advanced analytics and reporting
                    </h2>
                    <p className="text-lg my-8">
                        Run queries on your SQL databases in natural language, and generate visualizations, charts,
                        and dashboards using the <code>DATAKI</code> platform.
                        Connect to your BigQuery database and <b>ask questions</b> to generate
                        insights and visualizations.
                    </p>
                    <a
                        className={CTAOutlinedButtonWhiteMixin + " w-full lg:w-auto "}
                        href={"https://dataki.ai"}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Try DATAKI
                        <CTACaret/>
                    </a>
                </div>
                <LazyVideo autoPlay={true}
                       loop={true}
                       muted={true}
                       playsInline={true}
                       className={"lg:w-1/2 m-8 rounded-2xl"}
                       src={"https://dataki.ai/img/videos/gen_chart.webm"}
                       style={{
                           borderRadius: "8px"
                       }}>
                </LazyVideo>
            </div>


        </Panel>
    );
}

export default DatakiIntro;
