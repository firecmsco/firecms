import React from "react";
import { AdminDrawerMenu } from "./AdminDrawerMenu";
import { DataTalkDrawer } from "@firecms/datatalk";
import { DrawerLogo, useApp } from "@firecms/core";

/**
 * Default drawer used in FireCMS Cloud
 * @group Core
 */
export function FireCMSCloudDataTalkDrawer() {
    const { logo } = useApp();
    const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);

    return (

        <>

            <DrawerLogo logo={logo}/>
            <DataTalkDrawer/>

            <AdminDrawerMenu
                menuOpen={adminMenuOpen}
                setMenuOpen={setAdminMenuOpen}/>
        </>
    );
}
