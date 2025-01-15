import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import { ContainerInnerPaddingMixin, CTAButtonMixin, CTAOutlinedButtonMixin, defaultBorderMixin } from "../styles";
import CheckIcon from "@site/static/img/icons/check.svg";
import RemoveIcon from "@site/static/img/icons/remove.svg";
import ScheduleIcon from "@site/static/img/icons/schedule.svg";
import { LinedSpace } from "../layout/LinedSpace";
import { Panel } from "../general/Panel";
import clsx from "clsx";

const data = [{
        feature: "Unlimited projects",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes",
    }, {
        feature: "Unlimited collections",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "20+ form fields",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Subcollection support",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Collection editor UI",
        community: "No",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Data schema inference",
        community: "No",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Fine grained control",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Notion style editor",
        community: "No",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Data export",
        community: "No",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Data import",
        community: "No",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "User and role management",
        community: "Dev managed",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Custom form fields",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Custom entity views",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Dynamic properties",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Custom routes",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Firebase App Check",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "OpenAI data augmentation",
        community: "No",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "DataTalk",
        community: "No",
        cloud: "Yes",
        pro: "No"
    }, {
        feature: "Local text search",
        community: "No",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Text search",
        community: "Dev managed",
        cloud: "Dev managed",
        pro: "Dev managed"
    }, {
        feature: "Support",
        community: "Community",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "User and role management",
        community: "Dev managed",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Unlimited users",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Logo customisation",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "Self-hosted version",
        community: "Yes",
        cloud: "No",
        pro: "Yes"
    }, {
        feature: "Custom login screen",
        community: "Yes",
        cloud: "No",
        pro: "Yes"
    }, {
        feature: "Full theme customization",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    }, {
        feature: "CMS components customization",
        community: "Yes",
        cloud: "No",
        pro: "Yes"
    }, {
        feature: "Custom domain",
        community: "Yes",
        cloud: "No",
        pro: "Yes"
    }
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

        <Panel includePadding={false} color={"white"} innerClassName={" flex flex-col items-center justify-center"}
               header={<>
                   <LinedSpace size={"large"}/>

                   <div className={clsx("border-0 border-b w-full", defaultBorderMixin)}>
                       <h2 className={"uppercase font-mono my-8 text-center"} id={"comparison"}>
                           Versions comparison
                       </h2>
                   </div>
               </>}>


            <div className={ContainerInnerPaddingMixin}>

                <table
                    className="font-medium border-separate text-sm text-left mt-4 mb-8 mx-auto">

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
                            Community
                        </th>
                        <th scope="col"
                            className="border-none rounded-lg text-base md:px-4 md:py-4 text-center min-w-36">
                            Pro
                        </th>
                        <th scope="col"
                            className="border-none rounded-lg text-base md:px-4 md:py-4 text-center min-w-36">
                            Cloud
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
                                    className="bg-gray-50 mx-2 border-none rounded-lg px-6 py-2 text-gray-800 font-bold md:min-w-[360px]">
                                    {row.feature}
                                </td>
                                <td className={"bg-gray-50 mx-2  border-none rounded-lg px-4 py-2 text-gray-800  text-center " + getEntryClass(row.community)}>
                                    {getFeatureComponent(row.community)}
                                </td>
                                <td className={"bg-gray-50 mx-2  border-none rounded-lg px-4 py-2 text-gray-800  text-center " + getEntryClass(row.pro)}>
                                    {getFeatureComponent(row.pro)}
                                </td>
                                <td className={"bg-gray-50 mx-2  border-none rounded-lg px-4 py-2 text-gray-800  text-center " + getEntryClass(row.cloud)}>
                                    {getFeatureComponent(row.cloud)}
                                </td>

                                {/*<td className={"bg-gray-50 mx-2  border-none rounded-lg px-6 py-2 text-gray-800  text-center " + getEntryClass(row.community)}>*/}
                                {/*    {getFeatureComponent(row.community)}*/}
                                {/*</td>*/}
                            </tr>
                        ))
                    }
                    </tbody>

                    <tfoot
                        className="text-xs text-gray-800 uppercase font-mono bg-gray-50  font-bold">
                    <tr>
                        <th scope="col"
                            colSpan={2}
                            className="border-none rounded-lg px-6 py-3 invisible">
                        </th>
                        <th
                            className={" table-cell p-0 border-none"}
                            colSpan={1}
                        >
                            <a className={CTAOutlinedButtonMixin + " w-full"}
                               rel="noopener noreferrer"
                               target="_blank"
                               href={"/pro"}>
                                More info
                            </a>
                        </th>

                        <th
                            className={" table-cell p-0 border-none"}
                            colSpan={1}
                        >
                            <a className={CTAButtonMixin + " w-full"}
                               rel="noopener noreferrer"
                               target="_blank"
                               href={"https://app.firecms.co"}>
                                FireCMS Cloud
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
