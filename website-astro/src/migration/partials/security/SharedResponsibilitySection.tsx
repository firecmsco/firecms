import React from "react";
import { Panel } from "../general/Panel";
import { defaultBorderMixin } from "../styles";

export function SharedResponsibilitySection() {
    return (
        <Panel color={"white"} includePadding={true}>
            <div className="max-w-6xl mx-auto py-12 md:py-16">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4 uppercase">Shared Responsibility Model</h2>
                    <p className="text-xl text-gray-600 font-mono uppercase">
                        Clear division of security responsibilities for maximum protection.
                    </p>
                </div>

                <div className="overflow-x-auto mb-8">
                    <table className={"w-full border rounded-lg table-fixed " + defaultBorderMixin}>
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-4 text-left font-bold w-1/6">Security Domain</th>
                            <th className="p-4 text-left font-bold text-blue-600 w-1/4">Your Responsibility</th>
                            <th className="p-4 text-left font-bold text-green-600 w-1/4">FireCMS Provides</th>
                            <th className="p-4 text-left font-bold text-purple-600 w-1/3">Infrastructure (Google/MongoDB)</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-500 divide-opacity-30 dark:divide-slate-500 dark:divide-opacity-30">
                        <tr>
                            <td className="p-4 font-medium">Data Access Control</td>
                            <td className="p-4 text-sm">Write &amp; maintain security rules</td>
                            <td className="p-4 text-sm">RBAC system, permission builders</td>
                            <td className="p-4 text-sm">Rule enforcement at database level</td>
                        </tr>
                        <tr className="bg-gray-50">
                            <td className="p-4 font-medium">User Authentication</td>
                            <td className="p-4 text-sm">Configure auth providers</td>
                            <td className="p-4 text-sm">Firebase Auth integration, custom authenticators</td>
                            <td className="p-4 text-sm">Secure, scalable authentication service</td>
                        </tr>
                        <tr>
                            <td className="p-4 font-medium">Data Encryption</td>
                            <td className="p-4 text-sm">Optional client-side encryption</td>
                            <td className="p-4 text-sm">TLS/SSL connections</td>
                            <td className="p-4 text-sm">Encryption at rest and in transit</td>
                        </tr>
                        <tr className="bg-gray-50">
                            <td className="p-4 font-medium">Network Security</td>
                            <td className="p-4 text-sm">Configure firewalls, VPC settings</td>
                            <td className="p-4 text-sm">App Check integration</td>
                            <td className="p-4 text-sm">VPCs, DDoS protection, secure networking</td>
                        </tr>
                        <tr>
                            <td className="p-4 font-medium">Compliance</td>
                            <td className="p-4 text-sm">Act as Data Controller</td>
                            <td className="p-4 text-sm">Compliance-enabling tools</td>
                            <td className="p-4 text-sm">Certified infrastructure (ISO, SOC, etc.)</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <div className={"p-6 rounded-xl border bg-green-50 " + defaultBorderMixin}>
                    <h3 className="text-xl font-bold mb-4 text-green-900">Why This Model Works</h3>
                    <p className="text-green-800">
                        This shared responsibility approach gives you the flexibility to implement security controls
                        that match your specific requirements, while leveraging enterprise-grade infrastructure
                        security from day one. You get the best of both worlds: control and convenience.
                    </p>
                </div>
            </div>
        </Panel>
    );
}