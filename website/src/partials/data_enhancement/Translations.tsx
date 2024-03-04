import React from "react";
import { TwoColumns } from "../general/TwoColumns";
import { useColorMode } from "@docusaurus/theme-common";

// @ts-ignore
import translationLight from "@site/static/img/data/translations_light.png";
// @ts-ignore
import translationDark from "@site/static/img/data/translations_dark.png";
import clsx from "clsx";
import { defaultBorderMixin } from "../styles";
import { Panel } from "../general/Panel";

export function Translations() {

    const { colorMode } = useColorMode();
    const isDarkTheme = colorMode === "dark";
    return (
        <Panel>
            <TwoColumns
                left={<>
                    <h2 className={"h2"}>
                        Are you managing translations?
                    </h2>
                    <p className="text-xl">
                        Translate your content to any language with the click of a button.
                    </p>
                    <p className="text-xl">
                        Let FireCMS handle the translation for you. You can then
                        edit the generated content and save it to your database.
                    </p>
                    <p className="text-xl">
                        You can also manage translations for your custom fields.
                    </p>
                </>}
                right={<>
                    <div
                        style={{
                            maxHeight: "692px",
                        }}
                        data-aos="fade-up"
                        className={" flex content-center justify-center"}>
                        <img loading="lazy"
                             className={clsx("rounded-xl border", defaultBorderMixin)}
                             src={isDarkTheme ? translationDark : translationLight}
                             width="500"
                             alt="Element"
                        />
                    </div>
                </>}/>
        </Panel>
    );
}
