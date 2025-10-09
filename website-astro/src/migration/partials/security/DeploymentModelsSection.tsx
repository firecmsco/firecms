import React from "react";
import { Panel } from "../general/Panel";
import { defaultBorderMixin } from "../styles";
import { CheckCircleIcon, CloudUploadIcon, MonitorIcon } from "@firecms/ui";

export function DeploymentModelsSection() {
    return (
        <Panel color={"lighter"} includePadding={true}>
            <div className="py-12 md:py-16 max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4 uppercase">Choose Your Security Posture</h2>
                    <p className="text-xl text-gray-600 font-mono uppercase">
                        Multiple deployment options, same data sovereignty principles.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Self-Hosted */}
                    <div className={"p-8 rounded-xl border bg-white " + defaultBorderMixin}>
                        <div className="flex items-center mb-4">
                            <MonitorIcon className="w-8 h-8 mr-2 mt-2 text-green-600 flex-shrink-0"/>
                            <h3 className="text-2xl font-bold m-0">Self-Hosted</h3>
                        </div>

                        <p className="text-gray-700 mb-4">
                            Ultimate control and transparency. Deploy FireCMS entirely within your own infrastructure.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5 ">Open-source MIT license available</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0"/>
                                <span
                                    className="text-sm text-gray-700 mt-0.5">Deploy on any static hosting provider</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5">No external dependencies or proprietary servers</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5">Full code auditability</span>
                            </div>
                        </div>

                        <div className={"p-4 rounded-lg bg-green-50 border " + defaultBorderMixin}>
                            <p className="text-green-800 text-sm font-medium">
                                <strong>Best for:</strong> Regulated industries, enterprises with strict security
                                requirements,
                                and teams that need maximum control.
                            </p>
                        </div>
                    </div>

                    {/* FireCMS Cloud */}
                    <div className={"p-8 rounded-xl border bg-white " + defaultBorderMixin}>
                        <div className="flex items-center mb-4">
                            <CloudUploadIcon className="w-8 h-8 mr-2 mt-2  text-blue-600 flex-shrink-0"/>
                            <h3 className="text-2xl font-bold m-0">FireCMS Cloud</h3>
                        </div>

                        <p className="text-gray-700 mb-4">
                            Fully managed convenience without sacrificing data ownership.
                            Your data stays in your Firebase project.
                        </p>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5">Service account credentials encrypted with Google Cloud KMS</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5">Transparent connection mechanism</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5">Custom React components supported</span>
                            </div>
                            <div className="flex items-start space-x-3">
                                <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0"/>
                                <span className="text-sm text-gray-700 mt-0.5">Same data sovereignty guarantees</span>
                            </div>
                        </div>

                        <div className={"p-4 rounded-lg bg-blue-50 border " + defaultBorderMixin}>
                            <p className="text-blue-800 text-sm font-medium">
                                <strong>Best for:</strong> Startups and teams prioritizing speed and convenience
                                while maintaining data ownership.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    );
}