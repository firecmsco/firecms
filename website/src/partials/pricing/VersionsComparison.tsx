import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import { ContainerInnerPaddingMixin, CTAButtonMixin, defaultBorderMixin } from "../styles";
import CheckIcon from "@site/static/img/icons/check.svg";
import RemoveIcon from "@site/static/img/icons/remove.svg";
import ScheduleIcon from "@site/static/img/icons/schedule.svg";
import { LinedSpace } from "../layout/LinedSpace";
import { Panel } from "../general/Panel";
import clsx from "clsx";

const data = [{
        feature: "Unlimited projects",
        selfHosted: "Yes",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes",
    }, {
        feature: "Unlimited collections",
        selfHosted: "Yes",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "20+ form fields",
        selfHosted: "Yes",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Subcollection support",
        selfHosted: "Yes",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes"
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
        feature: "Data import",
        selfHosted: "No",
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
        feature: "Custom form fields",
        selfHosted: "Yes",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Custom entity views",
        selfHosted: "Yes",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Dynamic properties",
        selfHosted: "Yes",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Custom routes",
        selfHosted: "Yes",
        cloud: "Yes",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Firebase App Check",
        selfHosted: "Yes",
        cloud: "No",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    },{
        feature: "OpenAI data augmentation",
        selfHosted: "With subscription",
        cloud: "No",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Local text search",
        selfHosted: "Dev managed",
        cloud: "No",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Text search",
        selfHosted: "Dev managed",
        cloud: "No",
        cloudPlus: "Dev managed",
        cloudPro: "Dev managed"
    }, {
        feature: "Support",
        selfHosted: "Enterprise",
        cloud: "No",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Custom user roles",
        selfHosted: "Dev managed",
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
        feature: "Logo customisation",
        selfHosted: "Yes",
        cloud: "No",
        cloudPlus: "Yes",
        cloudPro: "Yes"
    }, {
        feature: "Self-hosted version",
        selfHosted: "Yes",
        cloud: "No",
        cloudPlus: "No",
        cloudPro: "Yes"
    }, {
        feature: "Custom login screen",
        selfHosted: "Yes",
        cloud: "No",
        cloudPlus: "No",
        cloudPro: "Yes"
    }, {
        feature: "Full theme customization",
        selfHosted: "Yes",
        cloud: "No",
        cloudPlus: "No",
        cloudPro: "Yes"
    }, {
        feature: "CMS components customization",
        selfHosted: "Yes",
        cloud: "No",
        cloudPlus: "No",
        cloudPro: "Yes"
    }, {
        feature: "Custom domain",
        selfHosted: "No",
        cloud: "No",
        cloudPlus: "No",
        cloudPro: "Yes"
    },
        // {
        //     feature: "SAML SSO",
        //     selfHosted: "No",
        //     cloud: "No",
        //     cloudPlus: "No",
        //     cloudPro: "Yes"
        // }
    ]
;

export function VersionsComparison() {

    function getFeatureComponent(value: string) {
        if (value === "Enterprise")
            return <a className="text-inherit"
                      href={useBaseUrl("enterprise/")}>Enterprise</a>
        if (value === "Yes")
            return <CheckIcon className="m-auto" width={24}/>
        if (value === "No")
            return <RemoveIcon className="m-auto" width={24}/>
        if (value === "WIP")
            return <ScheduleIcon className="m-auto" width={24}/>
        return value;
    }

    return <>

        <Panel includePadding={false} color={"white"} innerClassName={" flex flex-col items-center justify-center"}>

            <LinedSpace/>

            <div className={clsx("border-0 border-b w-full", defaultBorderMixin)}>
                <h2 className={clsx("text-3xl md:text-4xl font-bold my-8 text-center ")}>
                    Versions comparison
                </h2>
            </div>

            <div className={ContainerInnerPaddingMixin}>

                <table
                    className="font-medium border-separate text-sm text-left my-8 mx-auto">

                    {/*<thead*/}
                    {/*    className="text-xs text-gray-800 uppercase font-mono bg-gray-50  font-bold">*/}
                    {/*<tr>*/}
                    {/*    <th colSpan={1} scope="col"*/}
                    {/*        className="border-none rounded-lg md:px-6 md:py-4 invisible">*/}
                    {/*    </th>*/}
                    {/*    <th scope="col"*/}
                    {/*        colSpan={3}*/}
                    {/*        className="border-none rounded-lg text-base md:px-6 md:py-4 text-center ">*/}
                    {/*        FireCMS Cloud*/}
                    {/*    </th>*/}
                    {/*</tr>*/}
                    {/*</thead>*/}

                    <thead
                        className="text-sm text-gray-800 uppercase font-mono bg-gray-50 font-bold">
                    <tr>
                        <th scope="col"
                            className="border-none rounded-lg md:px-6 py-6 invisible">
                        </th>
                        <th scope="col"
                            className="border-none rounded-lg text-base md:px-4 md:py-4 text-center min-w-36">
                            Free
                        </th>
                        <th scope="col"
                            className="border-none rounded-lg text-base md:px-4 md:py-4 text-center min-w-36">
                            Plus
                        </th>
                        <th scope="col"
                            className="border-none rounded-lg text-base md:px-4 md:py-4 text-center min-w-36">
                            Pro
                        </th>
                        {/*<th scope="col"*/}
                        {/*    className="border-none rounded-lg text-base md:px-6 md:py-4 text-center ">*/}
                        {/*    Self-hosted*/}
                        {/*</th>*/}
                    </tr>
                    </thead>

                    <tbody>
                    {data.map((row, index) =>
                        (
                            <tr className="border-b ">
                                <td scope="row"
                                    className="bg-gray-50 mx-2 border-none rounded-lg px-6 py-2 text-gray-800 font-bold">
                                    {row.feature}
                                </td>
                                <td className={"bg-gray-50 mx-2  border-none rounded-lg px-4 py-2 text-gray-800  text-center " + getEntryClass(row.cloud)}>
                                    {getFeatureComponent(row.cloud)}
                                </td>
                                <td className={"bg-gray-50 mx-2  border-none rounded-lg px-4 py-2 text-gray-800  text-center " + getEntryClass(row.cloudPlus)}>
                                    {getFeatureComponent(row.cloudPlus)}
                                </td>
                                <td className={"bg-gray-50 mx-2  border-none rounded-lg px-4 py-2 text-gray-800  text-center " + getEntryClass(row.cloudPro)}>
                                    {getFeatureComponent(row.cloudPro)}
                                </td>
                                {/*<td className={"bg-gray-50 mx-2  border-none rounded-lg px-6 py-2 text-gray-800  text-center " + getEntryClass(row.selfHosted)}>*/}
                                {/*    {getFeatureComponent(row.selfHosted)}*/}
                                {/*</td>*/}
                            </tr>
                        ))
                    }
                    </tbody>

                    <tfoot
                        className="text-xs text-gray-800 uppercase font-mono bg-gray-50  font-bold">
                    <tr>
                        <th scope="col"
                            className="border-none rounded-lg px-6 py-3 invisible">
                        </th>
                        <th
                            className={" table-cell p-0 border-none"}
                            colSpan={3}
                        >
                            <a className={CTAButtonMixin + " w-full"}
                               rel="noopener noreferrer"
                               target="_blank"
                               href={"https://app.firecms.co"}>
                                Get started
                            </a>
                        </th>
                        {/*<a*/}
                        {/*    className={CTAOutlinedButtonMixin + " table-cell md:px-6"}*/}
                        {/*    href={useBaseUrl("docs/")}*/}
                        {/*>*/}
                        {/*    Self-hosted docs*/}
                        {/*</a>*/}
                    </tr>
                    </tfoot>
                </table>
            </div>
        </Panel>
    </>

}

function getEntryClass(value: React.ReactNode) {
    if (value === "Yes")
        return "bg-green-100 text-green-900";
    if (value === "Pro")
        return "bg-blue-100 text-blue-900 font-bold";
    if (value === "Plus" || value === "Enterprise")
        return "bg-blue-100 text-blue-900";
    if (value === "WIP")
        return "bg-yellow-100 text-yellow-900";
    return "";
}
