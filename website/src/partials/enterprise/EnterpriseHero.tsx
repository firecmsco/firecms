import React from "react";
import { CTAButtonMixin } from "../utils";
import { Hero } from "../general/Hero";

export function EnterpriseHero() {

    return <Hero
        title={
            <>
                <span className="block xl:inline">Enterprise</span>
                <span className="block text-primary xl:inline">Solutions</span>
            </>}
        subtitle={
            <>
                <p>FireCMS was built in the heart of the enterprise. We know
                    what it takes to build a successful product and we are here
                    to help you.</p>
            </>}
        cta={<a href="mailto:hello@camberi.com?subject=FireCMS%20consulting"
                rel="noopener noreferrer"
                target="_blank"
                className={CTAButtonMixin}>
            Get in touch
        </a>}
    />;
}
