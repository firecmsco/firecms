import useBaseUrl from "@docusaurus/useBaseUrl";
import React from "react";

import { TypeAnimation } from "react-type-animation";
import {
  ContainerInnerPaddingMixin,
  CTACaret,
  CTAOutlinedButtonMixin,
  CTAOutlinedButtonWhiteMixin,
  defaultBorderMixin
} from "../styles";
import { Panel } from "../general/Panel";
import clsx from "clsx";

export function FocusOnBusiness() {

    return <Panel color={"primary"} includePadding={false}>
      <div
        className={clsx("h1 relative items-center text-white uppercase border-b border-0",
          ContainerInnerPaddingMixin,
          defaultBorderMixin)}>
        <h4 className="h1 mb-4 text-white uppercase md:inline">
          Focus on your <b>Business</b>
        </h4>

      </div>

      <div className={ContainerInnerPaddingMixin}>
        <div
          className={clsx("h2 relative flex flex-col items-center p-6  rounded-2xl border border-solid", defaultBorderMixin)}>
          <TypeAnimation
            sequence={[
              "How many products with a rating lower than 4?",
              5000,
              "Update the price of the products with a rating lower than 4 by a 10%",
              5000,
              "Delete the products with less than 10 units in stock",
              5000,
              "Show me the products with the highest sales",
              5000,
            ]}
            wrapper="div"
            className={"md:inline text-white"}
            cursor={true}
            repeat={Infinity}
          />
        </div>

      </div>

      <div className={ContainerInnerPaddingMixin}>
        <div
          className={clsx("h1 relative items-center text-white uppercase border-b border-0",
            ContainerInnerPaddingMixin)}>
          <h4 className="h1 line-through mb-4 text-white uppercase md:inline">
            Not SQL
          </h4>
        </div>

        <div className={ContainerInnerPaddingMixin}>
          <div
            className={clsx("h2 relative flex flex-col items-center p-6  rounded-2xl border border-solid", defaultBorderMixin)}>
            <span className={"md:inline text-white"}>
              {"Select * from products where products.rating < 4"}
            </span>
          </div>

        </div>

      </div>


    </Panel>;
}
