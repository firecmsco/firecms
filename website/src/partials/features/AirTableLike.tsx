// @ts-ignore
import schemaEditorVideo from "@site/static/img/schema_editor.webm";

import { Panel } from "../general/Panel";
import { ContainerMixin, CTACaret, CTAOutlinedButtonMixin, defaultBorderMixin } from "../styles";

export function AirTableLike() {
    return (
        <>

            <Panel color={"light"}>
                <div className="max-w-6xl mx-auto text-center py-12 h-32">

                </div>
            </Panel>

            <Panel color={"lighter"}>
                <div
                    className={ContainerMixin + " -translate-y-44"}>
                    <video
                        style={{
                            pointerEvents: "none",
                        }}
                        className={"rounded-xl border " + defaultBorderMixin}
                        width="100%" loop autoPlay muted>
                        <source src={schemaEditorVideo} type="video/mp4"/>
                    </video>
                </div>

                {/*<div*/}
                {/*    className="max-w-5xl md:max-w-5xl md:w-full mx-auto md:col-span-9 md:pr-8 flex justify-center flex-col h-full mb-16">*/}
                {/*    <BrowserFrame>*/}
                {/*        <video*/}
                {/*            className={"pointer-events-none"}*/}
                {/*            width="100%" loop autoPlay muted>*/}
                {/*            <source src={inlineEditingVideo}*/}
                {/*                    type="video/mp4"/>*/}
                {/*        </video>*/}
                {/*    </BrowserFrame>*/}
                {/*</div>*/}

                <div
                    className={"mx-auto md:col-span-9 md:pr-8 flex justify-center flex-col h-full mb-8 -mt-24"}>
                    <div className={"flex items-center mb-3"}>

                        <h2 className="m-0 uppercase text-gray-700">
                            AirTable-like UI for your data
                        </h2>

                    </div>
                    <p className="text-xl md:text-2xl ">
                        FireCMS provides all the flexibility you
                        need with the best UX.
                        Edit your collections and entities using
                        both a <b>spreadsheet
                        view</b> and <b>powerful forms</b>.
                    </p>

                    <p className="text-xl ">
                        Inline editing is very useful when you want to
                        quickly edit a few fields of a
                        document. For example, if you have a list of users,
                        you can quickly edit the
                        name of the user by clicking on the name and editing
                        it.
                    </p>

                    <a
                        className={CTAOutlinedButtonMixin + " w-fit"}
                        href="https://demo.firecms.co"
                        rel="noopener noreferrer"
                        target="_blank">
                        Try the demo
                        <CTACaret/>
                    </a>
                </div>
            </Panel>
        </>
    );
}
