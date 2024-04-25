import React, { PropsWithChildren } from "react";
import { Scaffold, ScaffoldProps } from "@firecms/core";
import { SaasCMSAppBar } from "./SaasAppBar";

/**
 * @group Core
 */
export interface SaasScaffoldProps {
    includeProjectSelect?: boolean;
}

/**
 *
 * @param props
 * @constructor
 * @group Core
 */
export const DataTalkScaffold = function SaasScaffold(props: PropsWithChildren<SaasScaffoldProps>) {

    const {
        children,
        includeProjectSelect,
    } = props;

    const scaffoldProps: ScaffoldProps<{}, SaasScaffoldProps> = {
        name: "",
        FireCMSAppBar: SaasCMSAppBar,
        includeDrawer: false,
        fireCMSAppBarProps: {
            includeDrawer: false,
            includeProjectSelect,
        }
    }

    return <Scaffold
        {...scaffoldProps}>
        {children}
    </Scaffold>;
};
