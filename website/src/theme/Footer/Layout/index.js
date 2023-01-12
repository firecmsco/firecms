import React from "react";
import Layout from "@theme-original/Footer/Layout";
import { Newsletter } from "../../../partials/Newsletter";

export default function LayoutWrapper(props) {
    return (
        <div className={"mt-16"}>
            <Newsletter/>
            <section
                className="relative ">
                <div
                    className={"mx-auto px-4 sm:px-6 bg-primary text-white "}>
                    <div
                        className="relative flex flex-col items-center px-6 py-12">
                        <h4 className="h2 mb-4 text-white">
                            Need a hand?
                        </h4>

                        <div
                            className="flex flex-col space-y-2 items-center text-lg">
                            <div className={"text-center mb-4"}>
                                We are happy to offer consulting services to
                                help you get the most out of FireCMS.
                            </div>
                            <a href="mailto:hello@camberi.com?subject=FireCMS%20consulting"
                               rel="noopener noreferrer"
                               target="_blank"
                               className={"btn mx-auto sm:mb-0 font-bold py-4 bg-black text-white font-bold hover:text-white uppercase border border-solid w-full sm:w-auto rounded"}>
                                Get in touch
                            </a>
                        </div>

                        <div className="flex flex-wrap">
                            <div
                                className="w-full py-2 border-b-2 border-gray-400 flex justify-between gap-2">
                            </div>

                        </div>

                    </div>
                </div>
            </section>
            <Layout {...props} />
        </div>
    );
}
