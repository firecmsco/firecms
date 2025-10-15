import useBaseUrl from "@docusaurus/useBaseUrl";
import { CTACaret, CTAOutlinedButtonMixin } from "../styles";

export function StartHacking() {

    const docs = useBaseUrl("docs/");

    return (
        <>
            <h2 className={"mb-3 uppercase font-mono"}>
                Start hacking today
            </h2>

            <div>
                <p className={"text-lg"}>
                    Use our <b>CLI</b> to get started right away.
                </p>

                <p className={"text-lg"}>
                    By using the CLI to initialize
                    your project, you can customize your CMS in multiple ways, including <b>custom form
                    fields</b>, <b>actions</b>, <b>views</b>, <b>custom business
                    logic</b> and <b>authentication</b>.
                </p>

                <p className={"text-lg"}>
                    This way you can create a CMS tailored to your needs.
                </p>

                {/*<p className={"font-mono uppercase font-bold mb-2 mt-6"}>FireCMS Cloud</p>*/}
                <div className={"flex gap-4 items-center flex-col md:flex-row"}>

                    <div
                        className={"select-all font-mono text-gray-800 p-4 px-6 bg-gray-100 border-gray-300 border-solid w-fit text-md font-bold inline-flex rounded-md"}>
                        npx create-firecms-app
                    </div>
                    or
                    <div
                        className={"select-all font-mono text-gray-800 p-4 px-6 bg-gray-100 border-gray-300 border-solid w-fit text-md font-bold inline-flex rounded-md"}>
                        yarn create firecms-app
                    </div>

                    <a
                        className={CTAOutlinedButtonMixin}
                        href={docs}
                    >
                        Docs
                        <CTACaret/>
                    </a>
                </div>

            </div>
        </>
    );
}
