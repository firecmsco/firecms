import React from "react";
import useBaseUrl from "@docusaurus/useBaseUrl";
import useThemeContext from "@theme/hooks/useThemeContext";

function HeroButtons() {

    const { isDarkTheme } = useThemeContext();

    return <div
        className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center"
    >

        {isDarkTheme && <a
            style={{
                fontWeight: 700 // font-bold not working properly in prod for some reason
            }}
            className="btn mb-4 sm:mb-0 font-bold py-4 bg-transparent text-white font-bold hover:bg-white uppercase hover:text-black border border-solid border-white hover:border-transparent w-full sm:w-auto rounded"
            href={useBaseUrl("docs/")}
        >
            Get started
        </a>}
        {!isDarkTheme && <a
            style={{
                fontWeight: 700
            }}
            className="btn mb-4 sm:mb-0 font-bold py-4 bg-transparent text-gray-900 font-bold hover:bg-gray-900 uppercase hover:text-white border border-solid border-gray-900 hover:border-transparent w-full sm:w-auto rounded"
            href={useBaseUrl("docs/")}
        >
            Get started
        </a>}
        <a
            style={{
                fontWeight: 700
            }}
            className="btn px-12 py-4 text-white font-bold uppercase bg-blue-600 hover:text-white hover:bg-blue-700 w-full mb-4 sm:w-auto sm:mb-0 sm:ml-4"
            href="https://demo.firecms.co"
            target="_blank"
        >
            Demo
        </a>
    </div>;
}

export default HeroButtons;
