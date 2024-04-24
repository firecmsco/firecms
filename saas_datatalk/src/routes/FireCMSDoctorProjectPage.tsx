import { FireCMSBackend } from "@firecms/cloud";
import { useParams } from "react-router-dom";
import React from "react";
import { FireCMSProjectDoctor } from "../components/doctor/FireCMSProjectDoctor";
import { CenteredView } from "@firecms/ui";

export function FireCMSDoctorProjectPage({
                                             fireCMSBackend,
                                         }: {
    fireCMSBackend: FireCMSBackend,
}) {

    const { projectId } = useParams();
    if (!projectId) {
        throw new Error("FireCMSDoctor: projectId is undefined");
    }

    return <CenteredView maxWidth={"4xl"}>
        <FireCMSProjectDoctor fireCMSBackend={fireCMSBackend}
                              projectId={projectId}/>
    </CenteredView>

}
