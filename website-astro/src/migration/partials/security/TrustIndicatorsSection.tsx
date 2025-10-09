import React from "react";
import { Panel } from "../general/Panel";
import { defaultBorderMixin } from "../styles";
import {
    AccountTreeIcon,
    AppsIcon,
    CheckCircleIcon,
    DataObjectIcon,
    GroupsIcon,
    MonitorIcon,
    SecurityIcon,
    VerifiedUserIcon
} from "@firecms/ui";

export function TrustIndicatorsSection() {
    return (
        <Panel color={"lighter"} includePadding={true}>
            <div className="max-w-6xl mx-auto py-12 md:py-16">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4 uppercase">Trusted by Leading Organizations</h2>
                    <p className="text-xl text-gray-600 font-mono uppercase">
                        Enterprise teams trust FireCMS with their most critical data.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className={"p-6 rounded-xl border bg-white text-center " + defaultBorderMixin}>
                        <GroupsIcon className="w-8 h-8 mx-auto mb-3 text-blue-600"/>
                        <h3 className="text-2xl font-bold mb-2">10000+</h3>
                        <p className="my-1 text-gray-700 text-sm">Active Projects</p>
                    </div>

                    <div className={"p-6 rounded-xl border bg-white text-center " + defaultBorderMixin}>
                        <SecurityIcon className="w-8 h-8 mx-auto mb-3 text-green-600"/>
                        <h3 className="text-2xl font-bold mb-2">100%</h3>
                        <p className="my-1 text-gray-700 text-sm">Data Sovereignty</p>
                    </div>

                    <div className={"p-6 rounded-xl border bg-white text-center " + defaultBorderMixin}>
                        <MonitorIcon className="w-8 h-8 mx-auto mb-3 text-purple-600"/>
                        <h3 className="text-2xl font-bold mb-2">99.9%</h3>
                        <p className="my-1 text-gray-700 text-sm">Infrastructure Uptime</p>
                    </div>

                    <div className={"p-6 rounded-xl border bg-white text-center " + defaultBorderMixin}>
                        <VerifiedUserIcon className="w-8 h-8 mx-auto mb-3 text-orange-600"/>
                        <h3 className="text-2xl font-bold mb-2">24/7</h3>
                        <p className="my-1 text-gray-700 text-sm">Security Monitoring</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className={"p-6 rounded-xl border bg-white " + defaultBorderMixin}>
                        <AccountTreeIcon className="w-8 h-8 mb-4 text-blue-600"/>
                        <h3 className="text-xl font-bold mb-3">Open Source Transparency</h3>
                        <p className="my-1 text-gray-700 text-sm mb-4">
                            Full source code available on GitHub. Audit every line, contribute improvements,
                            or fork for custom needs.
                        </p>
                        <div className="flex items-start text-blue-600 text-sm font-medium">
                            <CheckCircleIcon

                                className="mr-2 mt-0.5 flex-shrink-0"/>
                            <span>MIT Licensed</span>
                        </div>
                    </div>

                    <div className={"p-6 rounded-xl border bg-white " + defaultBorderMixin}>
                        <DataObjectIcon className="w-8 h-8 mb-4 text-green-600"/>
                        <h3 className="text-xl font-bold mb-3">Battle-Tested Architecture</h3>
                        <p className="my-1 text-gray-700 text-sm mb-4">
                            Built on the same infrastructure that powers Gmail, YouTube, and millions
                            of mission-critical applications worldwide.
                        </p>
                        <div className="flex items-start text-green-600 text-sm font-medium">
                            <CheckCircleIcon

                                className="mr-2 mt-0.5 flex-shrink-0"/>
                            <span>Google Cloud Powered</span>
                        </div>
                    </div>

                    <div className={"p-6 rounded-xl border bg-white " + defaultBorderMixin}>
                        <AppsIcon className="w-8 h-8 mb-4 text-purple-600"/>
                        <h3 className="text-xl font-bold mb-3">Enterprise Support</h3>
                        <p className="my-1 text-gray-700 text-sm mb-4">
                            Professional support plans available with SLAs, dedicated channels,
                            and security consultation services.
                        </p>
                        <div className="flex items-start text-purple-600 text-sm font-medium">
                            <CheckCircleIcon

                                className="mr-2 mt-0.5 flex-shrink-0"/>
                            <span>24/7 Support Available</span>
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    );
}