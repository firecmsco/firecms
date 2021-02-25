import React from "react";
// @ts-ignore
import featuresBg from "@site/static/img/features-bg.png";
// @ts-ignore
import featuresElement from "@site/static/img/features-element.png";

// @ts-ignore
import ReactLogo from "@site/static/img/reactjs-icon.svg";
// @ts-ignore
import FireCMSLogo from "@site/static/img/firecms_logo.svg";
// @ts-ignore
import FirebaseLogo from "@site/static/img/firebase.svg";

function FirebaseIntro() {
    return (
        <section className="relative">

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
                {/*<div className="pt-12 md:pt-20">*/}
                <div
                    className="relative flex justify-center mb-12"
                    data-aos="fade-up"
                    data-aos-delay="150"
                >
                    <div
                        className="flex flex-row space-x-8 justify-center items-center">
                        <ReactLogo/>
                        <FirebaseLogo/>
                        <FireCMSLogo/>
                    </div>
                </div>

                <div
                    className="max-w-3xl mx-auto text-center pb-36 md:pb-40"
                    data-aos="fade-up"
                    data-aos-delay="100">
                    <h1 className="h2 mb-4">
                        Don't build another admin tool
                    </h1>
                    <p className="text-xl text-gray-600">
                        <b>FireCMS</b> is an open source CMS built by <b>developers
                        for developers</b>.
                        <br/>
                        Get a back office app for your Firebase project in
                        <b> no time</b>.
                    </p>
                    <div
                        className="mt-4"
                    >
                        <iframe
                            src="https://ghbtns.com/github-btn.html?user=Camberi&repo=FireCMS&type=star&count=true&size=large"
                            frameBorder="0" scrolling="0" width="170"
                            height="30" title="GitHub"/>
                    </div>
                </div>
                {/*</div>*/}
            </div>
        </section>
    );
}

export default FirebaseIntro;
