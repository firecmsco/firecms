import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";
import {CTACaret, CTAOutlinedButtonMixin, defaultBorderMixin} from "../styles";
import {gridIcon} from "../icons";
import MongoDBLogo from "@site/static/img/logos/mongodb.svg";
import FirestoreLogo from "@site/static/img/logos/firestore.svg";
import BigQueryLogo from "@site/static/img/logos/bigquery.svg";

import {useColorMode} from "@docusaurus/theme-common";
import {Panel} from "../general/Panel";
import {LinedSpace} from "../layout/LinedSpace";
import clsx from "clsx";

function DataStorageOptions() {

  const {colorMode} = useColorMode();
  const isDarkTheme = colorMode === "dark";

  return (
    <Panel
      color={"white"}
      includePadding={false}
    >

      <LinedSpace size={"large"}/>

      <div
        data-aos="fade-up"
        className={"flex items-center mb-4"}
      >
        <div>
          <p className={clsx("text-xl md:text-2xl  px-8 py-4 md:px-8")}>
            With DataTalk, <b>you own the Data</b>. We just help you understand it better.
          </p>
        </div>
      </div>
      <div
        className="mx-auto grid md:grid-cols-2 lg:grid-cols-3 items-start text-xl gap-4 px-8">
        <div
          className={clsx("relative flex flex-col items-center p-6  rounded-2xl border border-solid", defaultBorderMixin)}>
          <FirestoreLogo className="justify-center w-42 h-42 m-4"/>
          <h4 className="text-xl font-bold leading-snug tracking-tight  mt-2  mb-0 text-center">
            Firebase Firestore
          </h4>
          <p className=" text-center">
            The top notch NoSQL database from Firebase. We provide a seamless integration with DataTalk.
          </p>
          <div
            className="max-w-l mx-auto text-center py-6">
            Botón para empezar
            <a
              className={CTAOutlinedButtonMixin + " mx-auto"}
              href={useBaseUrl("features/")}
            >
              Get Started
              <CTACaret/>
            </a>
          </div>
        </div>

        <div
          className={clsx("relative flex flex-col items-center p-6  rounded-2xl border border-solid", defaultBorderMixin)}>
          <BigQueryLogo className="justify-center w-42 h-42 m-4"/>
          <h4 className="text-xl font-bold leading-snug tracking-tight  mt-2  mb-0 text-center">
            Google BigQuery
          </h4>
          <p className=" text-center">
            One of the best solutions in the market for data warehousing and analytics. Currently in private Beta.
          </p>
          <div
            className="max-w-l mx-auto text-center py-6">
            Aquí va un input con el email y un botón para unirse a la beta.
            <a
              className={CTAOutlinedButtonMixin + " mx-auto"}
              href={useBaseUrl("features/")}
            >
              Join the Beta
              <CTACaret/>
            </a>
          </div>
        </div>

        <div
          className={clsx("relative flex flex-col items-center p-6  rounded-2xl border border-solid", defaultBorderMixin)}>
          <MongoDBLogo className="justify-center w-42 h-42 m-4"/>
          <h4 className="text-xl font-bold leading-snug tracking-tight  mt-2  mb-0 text-center">
            MongoDB
          </h4>
          <p className=" text-center">
            Stay tuned, we are actively working on it. If you are in a hurry, contact us for a custom solution.
          </p>
        </div>
      </div>

      <LinedSpace size={"larger"} position={"top"}/>

      <LinedSpace size={"large"}/>

    </Panel>
  );
}

export default DataStorageOptions;
