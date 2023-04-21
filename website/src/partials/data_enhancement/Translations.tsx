import React from "react";
import { BrowserFrame } from "../BrowserFrame";
import { TwoColumns } from "../general/TwoColumns";
import { useColorMode } from "@docusaurus/theme-common";

// @ts-ignore
import translationLight from "@site/static/img/data/translations_light.png";
// @ts-ignore
import translationDark from "@site/static/img/data/translations_dark.png";

export function Translations() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";
    return (
        <TwoColumns
            left={<>
                <h2 className={"h2"}>
                    Are you managing translations?
                </h2>
                <p className="text-xl">
                    Translate your content to any language with the click of a
                    button.
                </p>
                <p className="text-xl">
                    Let FireCMS handle the translation for you. You can then
                    edit the generated content and save it to your database.
                </p>
            </>}
            right={<>
                <div
                    style={{
                        maxHeight: "692px",
                    }}
                    data-aos="fade-up"
                    className={" flex content-center justify-center"}>
                    <img
                        className={"rounded-xl border border-solid dark:border-gray-800 border-gray-200"}
                        src={isDarkTheme ? translationDark : translationLight}
                        width="500"
                        alt="Element"
                    />
                </div>
            </>}/>
    );
}
