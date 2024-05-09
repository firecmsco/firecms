import React from "react";
import { Panel } from "../general/Panel";
// @ts-ignore
import DataTalkSample from "@site/static/img/datatalk_features_sample.png";

export function VisualFeatures() {
    return (
        <>
          <Panel color={"white"}>
              <span>
                Un slideshow con las características de DataTalk. Por un lado, obtener información, actualizarla y un ejemplo de agregración de datos. Quizás uno también de añadir otra columna.
              </span>
            <img loading="lazy" src={DataTalkSample}
                 className={"rounded-xl"}
                 style={{
                   aspectRatio: 1280 / 700,
                 }}
                 alt="Editor"/>
          </Panel>

        </>
    );
}
