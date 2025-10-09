import React from "react";
import { Panel } from "../general/Panel";
import { defaultBorderMixin } from "../styles";
import { IntegrationInstructionsIcon, PolicyIcon, StorageIcon, VerifiedUserIcon } from "@firecms/ui";

export function PrivacyComplianceSection() {
    return (
        <Panel color={"gray"}>
            <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center mb-4 justify-center">
                        <PolicyIcon className="w-8 h-8 mr-2 mt-2 text-green-400 flex-shrink-0"/>
                        <h2 className="text-3xl font-bold text-white m-0">Privacy &amp; Compliance Ready</h2>
                    </div>

                    <p className="text-xl text-gray-100 mb-8 text-center">
                        FireCMS&apos;s architecture is designed to simplify your compliance journey
                        under <b>GDPR</b>, <b>CCPA</b>, and other global privacy regulations.
                    </p>

                    <div className="space-y-6 mb-8">
                        <div className={"p-5 rounded-lg border bg-gray-800 " + defaultBorderMixin}>
                            <div className="flex items-center">
                                <VerifiedUserIcon className="w-6 h-6 mr-3 text-green-400 flex-shrink-0"/>
                                <h5 className="font-bold text-white m-0">You Are the Data Controller</h5>
                            </div>
                            <p className="text-gray-200 text-sm my-1">
                                Under GDPR and CCPA, you maintain direct control and legal responsibility
                                for your end-user data, with Google/MongoDB as processors.
                            </p>
                        </div>

                        <div className={"p-5 rounded-lg border bg-gray-800 " + defaultBorderMixin}>
                            <div className="flex items-center">
                                <IntegrationInstructionsIcon className="w-6 h-6 mr-3 text-blue-400 flex-shrink-0"/>
                                <h5 className="font-bold text-white m-0">Simplified Data Subject Requests</h5>
                            </div>
                            <p className="text-gray-200 text-sm my-1">
                                Fulfill access, correction, and deletion requests directly in your database
                                using the FireCMS interface - no third-party mediation required.
                            </p>
                        </div>

                        <div className={"p-5 rounded-lg border bg-gray-800 " + defaultBorderMixin}>
                            <div className="flex items-center">
                                <StorageIcon className="w-6 h-6 mr-3 text-purple-400 flex-shrink-0"/>
                                <h5 className="font-bold text-white m-0">Data Residency Control</h5>
                            </div>
                            <p className="text-gray-200 text-sm my-1">
                                Choose your Firebase or MongoDB Atlas region to meet specific
                                geographical data residency requirements.
                            </p>
                        </div>
                    </div>
                </div>

                <div className={"max-w-4xl mx-auto mt-12 p-6 rounded-xl bg-gray-800 "}>
                    <h3 className="text-xl font-bold mb-4 text-white">Compliance Inheritance</h3>
                    <p className="text-gray-100 mb-4">
                        By building on Google Cloud and MongoDB Atlas, your FireCMS applications inherit
                        extensive compliance certifications:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-200">
                        <ul className="space-y-1">
                            <li>• ISO 27001, SOC 1/2/3</li>
                            <li>• HIPAA (MongoDB Atlas)</li>
                            <li>• PCI DSS</li>
                        </ul>
                        <ul className="space-y-1">
                            <li>• FedRAMP Moderate</li>
                            <li>• EU-US Data Privacy Framework</li>
                            <li>• Industry-specific certifications</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Panel>
    );
}