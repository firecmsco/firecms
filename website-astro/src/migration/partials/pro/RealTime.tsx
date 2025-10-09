import React from "react";
import { ContainerSmallMixin } from "../styles";
import { BrowserFrame } from "../BrowserFrame";

// @ts-ignore
const lightingIcon = "/img/icons/lighting.svg";
// @ts-ignore
const inlineEditingVideo = "/img/inline_table_editing.mp4";

function RealTime() {

    return (
        <section className={ContainerSmallMixin + " my-16"}>

            <div className={"flex items-center mb-3 "}>

                <div
                    className="flex items-center justify-center text-white w-10 h-10 bg-gray-900 rounded-full shadow flex-shrink-0 mr-3">
                    <img src={lightingIcon} alt="lighting" width={12} height={12} />
                </div>

                <h3 className="m-0">
                    Real-time updates
                </h3>

            </div>

            <p>FireCMS uses Firestore or MongoDB as a backend, both <strong>real-time
                databases</strong>. This means
                that any change in the database is reflected in the CMS in real
                time.
                This is a very powerful feature that allows you to have a CMS
                that is always up-to-date.</p>

            <p>These updates will be reflected both in the table and in the edit
                form (as long
                as you have not modified the specific field that was
                updated).</p>

            <p>This allows you to move some of your logic to backend functions,
                or have completely dynamic data, and still have a CMS that is always
                up-to-date.</p>

            <p>
                By using a built-in backend like Firebase or MongoDB Atlas, you can leverage all the advanced features
                that these services provide, such as <strong>serverless backend functions</strong>, <strong>user
                authentication</strong>,
                <strong>file storage</strong>,
                and more.
            </p>

            <p>There are very <strong>few CMSs</strong> that show always
                up-to-date data, so if this a feature
                you need, FireCMS is your best bet!</p>

            <div
                className="max-w-5xl md:max-w-5xl md:w-full mx-auto md:col-span-9 md:pr-8 flex justify-center flex-col h-full">
                <BrowserFrame>
                    <video
                        style={{
                            pointerEvents: "none",
                        }}
                        width="100%" loop autoPlay muted>
                        <source src={inlineEditingVideo}
                                type="video/mp4"/>
                    </video>
                </BrowserFrame>
            </div>

        </section>
    );
}

export default RealTime;
