import React from "react";
import { Panel } from "../general/Panel";
import { CTAButtonMixin, CTACaret, CTAOutlinedButtonMixin } from "../styles";

export function CallToActionSection() {
    return (
        <Panel color={"dark_gray"} includePadding={true}>
            <div className="max-w-6xl mx-auto text-center py-12 md:py-16">
                <h2 className="text-3xl font-bold text-white mb-4">
                    Ready to Give It a Try?
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                    Experience unmatched security and control. Join industry leaders who trust FireCMS
                    to keep their data sovereign while delivering powerful content management.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="https://demo.firecms.co"
                        className={"px-8 py-3 rounded-lg transition-all duration-200 " + CTAOutlinedButtonMixin}
                        rel="noopener noreferrer"
                        target="_blank"
                    >
                        Try the Demo
                    </a>
                    <a
                        href="https.app.firecms.co"
                        className={CTAButtonMixin + " inline-flex items-center"}
                    >
                        Register for FireCMS Cloud
                        <CTACaret/>
                    </a>
                </div>
            </div>
        </Panel>
    );
}