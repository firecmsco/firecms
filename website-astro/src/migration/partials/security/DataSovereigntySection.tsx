import React from "react";
import { Panel } from "../general/Panel";
import { defaultBorderMixin } from "../styles";
import { CheckCircleIcon, StorageIcon } from "@firecms/ui";

const DataSovereigntyImage = "/img/demo-botanic-plant-firestore.png";

export function DataSovereigntySection() {
    return (
        <Panel color={"gray"}>
            <div className="py-12 md:py-16 max-w-6xl mx-auto px-4 py-12 md:py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="flex items-center mb-4">
                            <StorageIcon className="w-8 h-8 mr-2 mt-2 text-blue-400 flex-shrink-0"/>
                            <h2 className="text-xl font-bold text-white m-0">Your Data, Your Infrastructure</h2>
                        </div>
                        <p className="text-xl text-gray-100 mb-4">
                            Unlike traditional SaaS CMS platforms that ingest and control your data,
                            FireCMS operates as a sophisticated tool that connects directly to <b>your own</b> database.
                        </p>

                        <div className="space-y-8 my-16">
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-6 h-6 text-green-400 mt-2 flex-shrink-0"/>
                                <div>
                                    <h4 className="font-semibold text-white">No Data Migration Required</h4>
                                    <p className="text-gray-200 text-sm m-1">
                                        FireCMS adapts to your existing data structure, not the other way around.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-6 h-6 text-green-400 mt-2 flex-shrink-0"/>
                                <div>
                                    <h4 className="font-semibold text-white">Zero Vendor Lock-in</h4>
                                    <p className="text-gray-200 text-sm m-1">
                                        Stop using FireCMS anytime - your data stays exactly where it is.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-6 h-6 text-green-400 mt-2 flex-shrink-0"/>
                                <div>
                                    <h4 className="font-semibold text-white">Direct Infrastructure Access</h4>
                                    <p className="text-gray-200 text-sm m-1">
                                        Full control over your Google Cloud or MongoDB Atlas project.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className={"rounded-xl border overflow-hidden " + defaultBorderMixin}>
                        <img
                            src={DataSovereigntyImage}
                            alt="Diagram showing FireCMS connecting to customer's own Firebase/MongoDB project with data remaining under customer control"
                            className="h-full w-full object-cover"
                        />
                    </div>
                </div>
            </div>
        </Panel>
    );
}