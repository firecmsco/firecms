import React, { useCallback, useState } from "react";
import { useCollectionsConfigController } from "@firecms/collection_editor";

import { AddIcon, Button, Container, Tooltip, Typography } from "@firecms/ui";
import { RolesTable } from "./RolesTable";
import { RolesDetailsForm } from "./RolesDetailsForm";
import { Role } from "@firecms/firebase";
import { SubscriptionPlanWidget } from "../subscriptions";
import { useUserManagement } from "../../hooks/useUserManagement";

export const RolesView = React.memo(
    function RolesView() {

        const { collections } = useCollectionsConfigController();
        const [dialogOpen, setDialogOpen] = useState(false);
        const [selectedRole, setSelectedRole] = useState<Role | undefined>();

        const { canEditRoles } = useUserManagement();

        const onRoleClicked = useCallback((user: Role) => {
            setDialogOpen(true);
            setSelectedRole(user);
        }, []);

        const handleClose = () => {
            setSelectedRole(undefined);
            setDialogOpen(false);
        };

        return (
            <Container className="w-full flex flex-col py-2 gap-4" maxWidth={"6xl"}>

                <SubscriptionPlanWidget
                    showForPlans={["free"]}
                    message={<>Upgrade to PLUS to be able to customise <b>roles</b></>}/>

                <div className="flex items-center mt-12">
                    <Typography gutterBottom variant="h4"
                                className="flex-grow"
                                component="h4">
                        Roles
                    </Typography>
                    <Tooltip title={!canEditRoles ? "Update plans to customise roles" : undefined}>
                        <Button
                            size={"large"}
                            disabled={!canEditRoles}
                            startIcon={<AddIcon/>}
                            onClick={() => setDialogOpen(true)}>
                            Add role
                        </Button>
                    </Tooltip>
                </div>

                <RolesTable onRoleClicked={onRoleClicked} editable={canEditRoles}/>

                <RolesDetailsForm
                    key={selectedRole?.id ?? "new"}
                    open={dialogOpen}
                    role={selectedRole}
                    editable={canEditRoles}
                    collections={collections}
                    handleClose={handleClose}/>

            </Container>
        )
    });
