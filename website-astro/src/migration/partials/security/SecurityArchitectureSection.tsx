import React from "react";
import { Panel } from "../general/Panel";
import { defaultBorderMixin } from "../styles";
import { AdminPanelSettingsIcon, CloudUploadIcon, VpnKeyIcon } from "@firecms/ui";

const SecurityArchitectureImage = "/img/firecms-layers.png";

export function SecurityArchitectureSection() {
    return (
        <Panel color={"white"} includePadding={true}>
            <div className="py-12 md:py-16 max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4 uppercase">Multi-Layered Security Architecture</h2>
                    <p className="text-xl text-gray-600 font-mono uppercase">
                        Security through shared responsibility and defense in depth.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                    <div className="rounded-xl overflow-hidden p-6 bg-white">
                        <img
                            src={SecurityArchitectureImage}
                            alt="Security architecture diagram showing application layer, infrastructure layer, and database security layers"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <div className="space-y-6">
                        <div className={"p-5 rounded-lg border " + defaultBorderMixin}>
                            <div className="flex items-center mb-3">
                                <AdminPanelSettingsIcon className="w-6 h-6 mr-3 text-blue-600 flex-shrink-0"/>
                                <h3 className="text-lg font-bold m-0">Application Layer</h3>
                            </div>
                            <p className="text-gray-700 text-sm">
                                Granular role-based access control, dynamic permissions,
                                custom authentication integrations, and App Check protection.
                            </p>
                        </div>

                        <div className={"p-5 rounded-lg border " + defaultBorderMixin}>
                            <div className="flex items-center mb-3">
                                <CloudUploadIcon className="w-6 h-6 mr-3 text-green-600 flex-shrink-0"/>
                                <h3 className="text-lg font-bold m-0">Infrastructure Layer</h3>
                            </div>
                            <p className="text-gray-700 text-sm">
                                Enterprise-grade security from Google Cloud and MongoDB Atlas:
                                encryption, network security, compliance certifications.
                            </p>
                        </div>

                        <div className={"p-5 rounded-lg border " + defaultBorderMixin}>
                            <div className="flex items-center mb-3">
                                <VpnKeyIcon className="w-6 h-6 mr-3 text-purple-600 flex-shrink-0"/>
                                <h3 className="text-lg font-bold m-0">Database Security</h3>
                            </div>
                            <p className="text-gray-700 text-sm">
                                Your custom Firestore/MongoDB security rules enforce access at the data layer.
                                Ultimate control in your hands.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={"p-6 rounded-xl border bg-blue-50 " + defaultBorderMixin}>
                    <h3 className="text-xl font-bold mb-4 text-blue-900">Why This Architecture Matters</h3>
                    <p className="text-blue-800">
                        Unlike proprietary CMS platforms that create their own security abstractions,
                        FireCMS leverages and enhances the battle-tested security models of leading cloud providers.
                        This provides better security, easier compliance, and skills that transfer to your core
                        application development.
                    </p>
                </div>
            </div>
        </Panel>
    );
}