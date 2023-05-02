import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import {
    ContainerMixin,
    CTAButtonMixin,
    CTAOutlinedButtonMixin
} from "../utils";
import CheckIcon from "@site/static/img/icons/check.svg";
import RemoveIcon from "@site/static/img/icons/remove.svg";
import ScheduleIcon from "@site/static/img/icons/schedule.svg";


const data = [{
        feature: "Unlimited projects",
        selfHosted: "Yes",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes",
    }, {
        feature: "20+ form fields",
        selfHosted: "Yes",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Subcollection support",
        selfHosted: "Yes",
        cloud: "WIP",
        cloudPlus: "WIP",
        cloudPro: "WIP"
    }, {
        feature: "Collection editor",
        selfHosted: "No",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Data schema inference",
        selfHosted: "No",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Fine grained control",
        selfHosted: "Yes",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Data export",
        selfHosted: "Yes",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "User and role management",
        selfHosted: "Dev managed",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "OpenAI data augmentation",
        selfHosted: "With subscription",
        cloud: "No",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Support",
        selfHosted: "Enterprise",
        cloud: "No",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Text search",
        selfHosted: "Dev managed",
        cloud: "No",
        cloudPlus: "WIP",
        cloudPro: "WIP"
    }, {
        feature: "Custom user roles",
        selfHosted: "Dev managed",
        cloud: "No",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Unlimited collections",
        selfHosted: "Yes",
        cloud: "No",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Unlimited users",
        selfHosted: "Yes",
        cloud: "No",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Custom fields",
        selfHosted: "Yes",
        cloud: "No",
        cloudPlus: "WIP",
        cloudPro: "WIP"
    }, {
        feature: "Custom routes",
        selfHosted: "Yes",
        cloud: "No",
        cloudPlus: "No",
        cloudPro: "WIP"
    }, {
        feature: "Theme and logo customisation",
        selfHosted: "Yes",
        cloud: "No",
        cloudPlus: "No",
        cloudPro: "WIP"
    }, {
        feature: "Custom domain",
        selfHosted: "No",
        cloud: "No",
        cloudPlus: "No",
        cloudPro: "Yes"
    }, {
        feature: "SAML SSO",
        selfHosted: "No",
        cloud: "No",
        cloudPlus: "No",
        cloudPro: "Yes"
    }]
;

export function VersionsComparison() {

    function getFeatureComponent(value: string) {
        if (value === "Enterprise")
            return <a className="text-inherit"
                      href={useBaseUrl("enterprise/")}>Enterprise</a>
        if (value === "Yes")
            return <CheckIcon width={24}/>
        if (value === "No")
            return <RemoveIcon width={24}/>
        if (value === "WIP")
            return <ScheduleIcon width={24}/>
        return value;
    }

    return <section className={ContainerMixin + " max-w-full overflow-x-auto"}>

        <h2 className={"text-3xl md:text-4xl font-bold my-8 text-center"}>
            Features comparison
        </h2>
        <table
            className="font-medium  border-separate text-sm text-left my-8">

            <thead
                className="text-xs text-gray-800 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300 font-bold">
            <tr>
                <th colSpan={1} scope="col"
                    className="border-none rounded-lg md:px-6 md:py-4 invisible">
                </th>
                <th scope="col"
                    colSpan={3}
                    className="border-none rounded-lg text-base md:px-6 md:py-4 text-center ">
                    FireCMS Cloud
                </th>
            </tr>
            </thead>

            <thead
                className="text-xs text-gray-800 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300 font-bold">
            <tr>
                <th scope="col"
                    className="border-none rounded-lg md:px-6 py-6 invisible">
                </th>
                <th scope="col"
                    className="border-none rounded-lg text-base md:px-6 md:py-4 text-center ">
                    Free
                </th>
                <th scope="col"
                    className="border-none rounded-lg text-base md:px-6 md:py-4 text-center ">
                    Plus
                </th>
                <th scope="col"
                    className="border-none rounded-lg text-base md:px-6 md:py-4 text-center ">
                    Pro
                </th>
                <th scope="col"
                    className="border-none rounded-lg text-base md:px-6 md:py-4 text-center ">
                    Self-hosted
                </th>
            </tr>
            </thead>

            <tbody>
            {data.map((row, index) =>
                (
                    <tr className="border-b ">
                        <td scope="row"
                            className="bg-gray-50 mx-2 dark:bg-gray-900 border-none rounded-lg px-4 py-2 text-gray-800 dark:text-gray-300 font-bold">
                            {row.feature}
                        </td>
                        <td className={"bg-gray-50 mx-2 dark:bg-gray-800 border-none rounded-lg px-4 py-2 text-gray-800 dark:text-gray-200 text-center " + getEntryClass(row.cloud)}>
                            {getFeatureComponent(row.cloud)}
                        </td>
                        <td className={"bg-gray-50 mx-2 dark:bg-gray-800 border-none rounded-lg px-4 py-2 text-gray-800 dark:text-gray-200 text-center " + getEntryClass(row.cloudPlus)}>
                            {getFeatureComponent(row.cloudPlus)}
                        </td>
                        <td className={"bg-gray-50 mx-2 dark:bg-gray-800 border-none rounded-lg px-4 py-2 text-gray-800 dark:text-gray-200 text-center " + getEntryClass(row.cloudPro)}>
                            {getFeatureComponent(row.cloudPro)}
                        </td>
                        <td className={"bg-gray-50 mx-2 dark:bg-gray-800 border-none rounded-lg px-4 py-2 text-gray-800 dark:text-gray-200 text-center " + getEntryClass(row.selfHosted)}>
                            {getFeatureComponent(row.selfHosted)}
                        </td>
                    </tr>
                ))
            }
            </tbody>

            <tfoot
                className="text-xs text-gray-800 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-300 font-bold">
            <tr>
                <th scope="col"
                    className="border-none rounded-lg px-6 py-3 invisible">
                </th>
                <th
                    className={" table-cell p-0 border-none"}
                    colSpan={3}
                >
                    <a className={CTAButtonMixin + " w-full"}
                       href={"https://app.firecms.co"}>
                        Get started
                    </a>
                </th>
                <a
                    className={CTAOutlinedButtonMixin + " table-cell md:px-4"}
                    href={useBaseUrl("docs/")}
                >
                    More details
                </a>
                {/*<th*/}
                {/*    className={" table-cell p-0 border-none"}*/}
                {/*>*/}
                {/*    <a className={CTAButtonMixin + " w-full"} href={"https://app.firecms.co"}>*/}
                {/*    Get started*/}
                {/*    </a>*/}
                {/*</th>*/}
                {/*<th*/}
                {/*    className={" table-cell p-0 border-none"}*/}
                {/*>*/}
                {/*    <a className={CTAButtonMixin + " w-full"} href={"https://app.firecms.co"}>*/}
                {/*    Get started*/}
                {/*    </a>*/}
                {/*</th>*/}
            </tr>
            </tfoot>
        </table>
    </section>

}

function getEntryClass(value: React.ReactNode) {
    if (value === "Yes")
        return "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100";
    if (value === "Pro")
        return "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 font-bold";
    if (value === "Plus" || value === "Enterprise")
        return "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100";
    if (value === "WIP")
        return "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100";
    return "";
}
