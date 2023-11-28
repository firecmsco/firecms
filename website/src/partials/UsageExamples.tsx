import React from "react";
import clsx from "clsx";
import { ContainerPaddingMixin } from "./styles";

// @ts-ignore
import customFieldVideo from "@site/static/img/custom_fields.mp4";
// @ts-ignore
import customFieldDarkVideo from "@site/static/img/custom_fields_dark.mp4";
import { BrowserFrame } from "./BrowserFrame";
import { PhoneFrame } from "./PhoneFrame";

export function UsageExamples() {
    return <div className={clsx("bg-gray-200 flex items-center justify-center", ContainerPaddingMixin)}>
        <div className={"relative container"}
             style={{ height: 715 }}>
            <BrowserFrame className={
                "absolute -top-56 left-0 z-10 w-96 md:w-[540px] bg-gray-900"
            }>
                <video
                    style={{
                        aspectRatio: 540 / 515
                    }}
                    width="100%"
                    loop autoPlay muted>
                    <source
                        src={customFieldDarkVideo}
                        type="video/mp4"/>
                </video>
            </BrowserFrame>

            <PhoneFrame className="absolute -top-16 right-8 z-20">
                <video
                    style={{
                        aspectRatio: 272 / 570,
                        background: "white"
                    }}
                    className={"max-w-sm rounded-2xl"}
                    width="100%" loop autoPlay
                    muted>
                    <source src="/img/tpa_app.mp4"
                            type="video/mp4"/>
                </video>
            </PhoneFrame>
            {/*<img src="yourImagePath2" alt="img2" className="w-32 h-24 absolute top-0 left-8 z-20"/>*/}
            {/*<img src="yourImagePath3" alt="img3" className="w-32 h-24 absolute top-0 left-16 z-30"/>*/}
            {/*<img src="yourImagePath4" alt="img4" className="w-32 h-24 absolute top-0 left-24 z-40"/>*/}
            {/*<img src="yourImagePath5" alt="img5" className="w-32 h-24 absolute top-0 left-32 z-50"/>*/}
        </div>
        <div style={{ height: 715 }}></div>
    </div>
}
