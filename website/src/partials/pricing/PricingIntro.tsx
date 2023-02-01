import React from "react";
import { ContainerMixin } from "../utils";

export function PricingIntro() {
    return <section className={ContainerMixin}>
        <p>Self-Hosted Option: With our self-hosted option, you'll have access
            to all of our core features at no cost. Simply download and install
            on your own server, and enjoy complete control and
            customization.</p>

        <p>FireCMS Cloud: Our enterprise tier offers a complete, end-to-end
            solution for businesses that require the highest level of support
            and security. With dedicated hosting, advanced features, and expert
            support, you'll have everything you need to take your website to the
            next level.</p>
    </section>
}
