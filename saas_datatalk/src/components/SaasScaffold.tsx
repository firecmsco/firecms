import React, { PropsWithChildren } from "react";
import { Scaffold, ScaffoldProps } from "@firecms/core";
import { SaasCMSAppBar } from "./SaasAppBar";

/**
 * @group Core
 */
export interface SaasScaffoldProps {
    includeLogo?: boolean;
    includeProjectSelect?: boolean;
}

/**
 *
 * @param props
 * @constructor
 * @group Core
 */
export const SaasScaffold = function SaasScaffold(props: PropsWithChildren<SaasScaffoldProps>) {

    const {
        children,
        includeProjectSelect,
        includeLogo
    } = props;

    const scaffoldProps: ScaffoldProps<{}, SaasScaffoldProps> = {
        name: "FireCMS Cloud",
        FireCMSAppBar: SaasCMSAppBar,
        includeDrawer: false,
        fireCMSAppBarProps: {
            includeDrawer: false,
            includeProjectSelect,
            includeLogo
        }
    }

    return <Scaffold
        {...scaffoldProps}>
        {children}
    </Scaffold>;
};
