import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";

import { TypeAnimation } from "react-type-animation";
import {
    ContainerMixin,
    CTACaret,
    CTAOutlinedButtonWhiteMixin
} from "../utils";
import { Panel } from "../general/Panel";

export function ManageYour() {

    return <Panel color={"primary"}>
        <div
            className={" h1 relative items-center text-white uppercase "}>
            <h4 className="h1 mb-4 text-white uppercase md:inline">
                Manage your&nbsp;
            </h4>
            <TypeAnimation
                sequence={[
                    "Products",
                    1000,
                    "Invoices",
                    1000,
                    "Inventory",
                    1000,
                    "Podcasts",
                    1000,
                    "Fitness exercises",
                    1000,
                    "Recipes",
                    1000,
                    "Blogs",
                    1000,
                    "Events",
                    1000,
                ]}
                wrapper="div"
                className={"md:inline text-black"}
                cursor={true}
                repeat={Infinity}
            />
        </div>

        <div className={" mt-4 text-xl md:text-2xl"}>
            <p>
                FireCMS is <b>more than a CMS</b>, is a fully extendable app
                that will become the heart of your project.
            </p>
            <p>
                Enjoy the most powerful features
                of <strong>Firebase</strong> and build
                your own custom back-office app/admin panel in no time.
            </p>
            <p>
                Easy to get started, easy to customize and easy to extend.
                FireCMS is great both for existing projects, since it will
                adapt
                to any database structure you have, as well as for new ones.
            </p>
        </div>

        <div className={" mt-4 mx-auto"}>
            <a
                className={CTAOutlinedButtonWhiteMixin}
                href={useBaseUrl("features/")}
            >
                See all features
                <CTACaret/>
            </a>
        </div>
    </Panel>;
}
