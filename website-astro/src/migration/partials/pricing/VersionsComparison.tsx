import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import { ContainerInnerPaddingMixin, CTAButtonMixin, CTAOutlinedButtonMixin, defaultBorderMixin } from "../styles";
import CheckIcon from "@site/static/img/icons/check.svg";
import RemoveIcon from "@site/static/img/icons/remove.svg";
import ScheduleIcon from "@site/static/img/icons/schedule.svg";
import { LinedSpace } from "../layout/LinedSpace";
import { Panel } from "../general/Panel";
import clsx from "clsx";
import { Tip } from "./Tip";
import { AppLink } from "../../AppLink";

const data = [
    {
        feature: "Unlimited projects",
        tip: "You can create as many projects as you want",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes",
    },
    {
        feature: "Unlimited collections",
        tip: "Create as many data collections as needed for your project",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "20+ form fields",
        tip: "Utilize over 20 different form field types to capture data",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Subcollection support",
        tip: "Organize your data efficiently with subcollections",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Collection editor UI",
        tip: "User-friendly interface to manage your collections",
        community: "No",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Data schema inference",
        tip: "Automatically generate data schemas based on your data",
        community: "No",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Fine grained control",
        tip: "Manage permissions and access with detailed controls",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Notion style editor",
        tip: "Edit content seamlessly with an intuitive Notion-like interface",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Data history and authoring",
        tip: "See the history of your data changes and revert if needed",
        community: "No",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Data export",
        tip: "Easily export your data for backups or migrations",
        community: "No",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Data import (CSV, JSON, XLXS)",
        tip: "Effortlessly import data from various sources",
        community: "No",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "User and role management",
        tip: "Manage user permissions and define roles to control access",
        community: "Dev managed",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Custom form fields",
        tip: "Create tailored form fields to suit your specific needs",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Custom entity views",
        tip: "Design custom views for your data entities. Like product or page previews, dashboards, etc.",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Dynamic properties",
        tip: "Generate your properties dynamically based on other fields, data, logged in user...",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Custom routes",
        tip: "Define custom routes using React components to navigate your application.",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Firebase App Check",
        tip: "Enhance security with Firebase App Check integration",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "OpenAI data augmentation",
        tip: "Fill your data with AI-generated content, that understands your data structure",
        community: "No",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "DataTalk",
        tip: "Do large scale data operations with DataTalk, in a chat interface",
        community: "No",
        cloud: "Yes",
        pro: "No"
    },
    {
        feature: "Local text search",
        tip: "Quickly search through your data with local text search capabilities",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Text search",
        tip: "Integrate with external indexing services like Algolia or ElasticSearch",
        community: "Dev managed",
        cloud: "Dev managed",
        pro: "Dev managed"
    },
    {
        feature: "Support",
        tip: "Access community support or premium support based on your tier",
        community: "Community",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Unlimited users",
        tip: "Add an unlimited number of users to your project",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Logo customisation",
        tip: "Customize your application's logo to match your brand",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Self-hosted version",
        tip: "Host the CMS on your own infrastructure for greater control",
        community: "Yes",
        cloud: "No",
        pro: "Yes"
    },
    {
        feature: "Custom login screen",
        tip: "Design a custom login screen and integrate with your preferred authentication providers",
        community: "Yes",
        cloud: "No",
        pro: "Yes"
    },
    {
        feature: "Full theme customization",
        tip: "Fully customize the theme to align with your brand identity, including logo, colors, fonts, and more",
        community: "Yes",
        cloud: "Yes",
        pro: "Yes"
    },
    {
        feature: "Custom domain",
        tip: "Use your own custom domain for your application",
        community: "Yes",
        cloud: "No",
        pro: "Yes"
    }
];

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
                    className="table font-medium border-separate text-sm text-left mt-4 mb-8 mx-auto">

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
                            className="sticky top-20 z-10 border-none rounded-lg md:px-6 py-6 invisible">
                        </th>
                        <th scope="col"
                            style={{ top: "80px" }}
                            className=" bg-gray-50 sticky top-20 z-10 border-none rounded-lg text-base md:px-4 md:py-4 text-center min-w-36">
                            Community
                        </th>
                        <th scope="col"
                            style={{ top: "80px" }}
                            className=" bg-gray-50 sticky top-20 z-10 border-none rounded-lg text-base md:px-4 md:py-4 text-center min-w-36">
                            Pro
                        </th>
                        <th scope="col"
                            style={{ top: "80px" }}
                            className=" bg-gray-50 sticky top-20 z-10 border-none rounded-lg text-base md:px-4 md:py-4 text-center min-w-36">
                            Cloud
                        </th>
                    </tr>
                    {/*<tr scope="col"*/}
                    {/*    className="border-none rounded-lg text-base md:px-6 md:py-4 text-center ">*/}
                    {/*    Self-hosted*/}
                    {/*</tr>*/}
                    </thead>

                    <tbody>
                    {data.map((row, index) =>
                        (
                            <tr
                                key={index}
                                className="border-b ">
                                <td scope="row"
                                    className="bg-gray-50 mx-2 border-none rounded-lg px-6 py-2 text-gray-800 font-bold md:min-w-[360px]">
                                    {!row.tip && row.feature}
                                    {row.tip && <Tip tip={row.tip}>{row.feature}</Tip>}
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
                            <AppLink className={CTAButtonMixin + " w-full"}
                               rel="noopener noreferrer"
                               target="_blank"
                               href={"https://app.firecms.co"}
                               onClick={() => {
                                   // @ts-ignore
                                   if (window.gtag) {
                                       // @ts-ignore
                                       window.gtag("event", "go_to_app", {
                                           event_category: "pricing",
                                           event_label: "versions_comparison_cloud_cta"
                                       });
                                   }
                               }}

                            >
                                FireCMS Cloud
                            </AppLink>
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
