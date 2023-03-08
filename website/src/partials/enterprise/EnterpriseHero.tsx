import React from "react";
import { CTAButtonMixin } from "../utils";
import { Hero } from "../general/Hero";

export function EnterpriseHero() {

    return <Hero
        title={
            <>
                <span className="block lg:inline">Enterprise</span>
                <span className="block text-primary lg:inline">Solutions</span>
            </>}
        subtitle={
            <>
                <p>We know what it takes to build a successful product and we are here to help you.</p>
            </>}
        cta={<a href="mailto:hello@firecms.co?subject=FireCMS%20consulting"
                rel="noopener noreferrer"
                target="_blank"
                className={CTAButtonMixin}>
            Get in touch
        </a>}
    />;
}
