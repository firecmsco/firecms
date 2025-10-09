import React from "react";

import { CTACaret, CTAOutlinedButtonWhiteMixin } from "../styles";
import { Panel } from "../general/Panel";
import { LazyTypeAnimation } from "../ui/LazyTypeAnimation";

export function ManageYour() {

    return <Panel color={"primary"} includePadding={true}>
            <h2 className={"relative items-center text-white uppercase mt-8"}>
                <div className="mb-4 text-white uppercase md:inline">
                    Manage your&nbsp;
                </div>
                <LazyTypeAnimation/>
            </h2>

            <div className={"mt-8 text-xl md:text-2xl"}>
                <p>
                    FireCMS is a fully extendable app that will become the heart of your project.
                </p>
                <p>
                    Enjoy the most powerful features
                    of <strong>Firebase</strong> or <strong>MongoDB</strong> and build
                    your own custom back-office app/admin panel in no time.
                </p>
                <p>
                    <b>Easy to get started, easy to customize and easy to extend.</b> FireCMS is great both for existing
                    projects, since it will adapt to any database structure you have, as well as for new ones.
                </p>
            </div>

            <div className={"mt-6 mb-8"}>
                <a
                    className={CTAOutlinedButtonWhiteMixin}
                    href={"/features"}
                >
                    See all features
                    <CTACaret/>
                </a>
            </div>
    </Panel>;
}
