import { Panel } from "../general/Panel";
import { defaultBorderMixin } from "../styles";
import React from "react";
import { StartHacking } from "./StartHacking";

export function LaunchInSteps() {

    const [selectedTab, setSelectedTab] = React.useState<"cloud" | "self_hosted">("cloud");

    return <Panel color={"dark_gray"}>
        <div className="w-full px-6 lg:px-12 py-16">

            <div className="flex justify-center w-full mb-8">
                <div role="tablist"
                     className={"inline-flex space-x-1 rounded bg-black p-1 border " + defaultBorderMixin}>
                    <button role="tab"
                            aria-selected={selectedTab === "cloud"}
                            onClick={() => setSelectedTab("cloud")}
                            className={`rounded px-3 py-1 text-sm font-medium outline-none ${
                                selectedTab === "cloud"
                                    ? "text-white bg-gray-700 shadow-sm"
                                    : "text-gray-text-dark hover:bg-gray-700/30"
                            }`}>
                        Cloud
                    </button>
                    <button role="tab"
                            aria-selected={selectedTab === "self_hosted"}
                            onClick={() => setSelectedTab("self_hosted")}
                            className={`rounded px-3 py-1 text-sm font-medium outline-none ${
                                selectedTab === "self_hosted"
                                    ? "text-white bg-gray-700 shadow-sm"
                                    : "text-gray-text-dark hover:bg-gray-700/30"
                            }`}>
                        Self-hosted
                    </button>
                </div>
            </div>

            {selectedTab === "cloud" &&
                <div className={"w-full min-h-[450px] flex flex-col items-center justify-center"}>
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <h2 className="text-4xl font-bold mb-4">Launch Your Admin Panel in 3 Simple Steps</h2>
                    </div>
                    {/* Horizontal scroll on mobile with snap */}
                    <div
                        role="list"
                        aria-label="Steps"
                        className="flex flex-nowrap lg:flex-nowrap overflow-x-auto lg:overflow-visible gap-6 md:gap-8 lg:gap-10 -mx-6 px-6 md:mx-0 md:px-0 snap-x snap-mandatory w-full items-stretch no-scrollbar"
                    >
                        <div
                            role="listitem"
                            className={"snap-start min-w-[260px] sm:min-w-[280px] md:min-w-0 md:flex-1 flex-shrink-0 md:flex-shrink text-center md:text-left max-w-xs md:max-w-none mx-auto md:mx-0 rounded-2xl p-8 mb-4 md:mb-0 border " + defaultBorderMixin}>
                            <div className="mb-4 text-6xl font-bold text-primary">1</div>
                            <h3 className="text-xl font-semibold mb-2">Connect Your Project</h3>
                            <p className="text-sm text-gray-text-dark leading-relaxed">
                                We will setup a <b>Service Account</b> for you and connect it to your project.
                            </p>
                        </div>
                        <div
                            role="listitem"
                            className={"snap-start min-w-[260px] sm:min-w-[280px] md:min-w-0 md:flex-1 flex-shrink-0 md:flex-shrink text-center md:text-left max-w-xs md:max-w-none mx-auto md:mx-0 rounded-2xl p-8 mb-4 md:mb-0 border " + defaultBorderMixin}>
                            <div className="mb-4 text-6xl font-bold text-primary">2</div>
                            <h3 className="text-xl font-semibold mb-2">Define Your Data Models</h3>
                            <p className="text-sm text-gray-text-dark leading-relaxed">
                                Let FireCMS <b>infer your data structure</b> automatically or define it manually.
                            </p>
                        </div>
                        <div
                            role="listitem"
                            className={"snap-start min-w-[260px] sm:min-w-[280px] md:min-w-0 md:flex-1 flex-shrink-0 md:flex-shrink text-center md:text-left max-w-xs md:max-w-none mx-auto md:mx-0 rounded-2xl p-8 mb-4 md:mb-0 border " + defaultBorderMixin}>
                            <div className="mb-4 text-6xl font-bold text-primary">3</div>
                            <h3 className="text-xl font-semibold mb-2">Go Live Instantly</h3>
                            <p className="text-sm text-gray-text-dark leading-relaxed">
                                Access your fully functional, <b>production-ready</b> admin panel or CMS.
                            </p>
                        </div>
                    </div>
                </div>}
            {selectedTab === "self_hosted" &&
                <div className={"w-full min-h-[450px] flex flex-col items-center justify-center gap-4 md:flex-row"}>

                    <StartHacking/>
                </div>}
        </div>
    </Panel>;
}
