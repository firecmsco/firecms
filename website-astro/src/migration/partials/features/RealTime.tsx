import React from "react";

// Removed LightingIcon and inline video imports from @site alias; using /img paths
import { ContainerSmallMixin } from "../styles";
import { BrowserFrame } from "../BrowserFrame";

function RealTime() {


    const isDarkTheme = true;

    return (
        <section className={ContainerSmallMixin + " my-16"}>

            <div className={"flex items-center mb-3 "}>

                <div
                    className="flex items-center justify-center text-white w-10 h-10 bg-gray-900 rounded-full shadow flex-shrink-0 mr-3">
                    <img src="/img/icons/lighting.svg" alt="lighting" className="w-6 h-6"/>
                </div>

                <h3 className="m-0">
                    Real-time updates
                </h3>

            </div>

            <p>FireCMS uses Firestore as a data source, which is a <strong>real-time
                database</strong>. This means
                that any change in the database is reflected in the CMS in real
                time.
                This is a very powerful feature that allows you to have a CMS
                that is always
                up-to-date with the data in the database.</p>

            <p>These updates will be reflected both in the table and in the edit
                form (as long
                as you have not modified the specific field that was
                updated).</p>

            <p>This allows you to move some of your logic to backend functions,
                or have
                completely dynamic data, and still have a CMS that is always
                up-to-date.</p>

            <p>There is a big benefit to using Firebase/Firestore as a backend
                for your CMS:
                you can leverage all the advanced features that Google Cloud
                Platform offers,
                such as <strong>Cloud Functions</strong>, <strong>Cloud
                    Storage</strong>, <strong>BigQuery</strong>, etc.</p>

            <p>There are very <strong>few CMSs</strong> that show always
                up-to-date data, so if this a feature
                you need, FireCMS is your best bet!</p>

            <div
                className="max-w-5xl md:max-w-5xl md:w-full mx-auto md:col-span-9 md:pr-4 md:pr-8 flex justify-center flex-col h-full"
            >
                <BrowserFrame>
                    <video
                        style={{
                            pointerEvents: "none",
                        }}
                        width="100%" loop autoPlay muted>
                        <source src="/img/inline_table_editing.mp4" type="video/mp4"/>
                    </video>
                </BrowserFrame>
            </div>

        </section>
    );
}

export default RealTime;
