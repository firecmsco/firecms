import React from "react";
import { CTAButtonMixin, CTACaret } from "../styles";

function HeroButtons() {

    return <div className="mt-8 mb-8 ">
        <div className={"flex justify-center lg:flex-row flex-col-reverse items-center gap-4 px-4"}>
            <a
                className={CTAButtonMixin + " w-full lg:w-auto "}
                href={"https://app.firecms.co"}
                rel="noopener noreferrer"
                target="_blank"
            >
                Start The Data Talk
                <CTACaret/>
            </a>
        </div>
    </div>;
}

export default HeroButtons;
