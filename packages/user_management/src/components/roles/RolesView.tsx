import React, { useCallback, useState } from "react";

import { Role, useNavigationController } from "@firecms/core";
import { AddIcon, Button, Container, Typography } from "@firecms/ui";
import { RolesTable } from "./RolesTable";
import { RolesDetailsForm } from "./RolesDetailsForm";

export const RolesView = React.memo(
    function RolesView({ children }: { children?: React.ReactNode }) {

        const { collections } = useNavigationController();
        const [dialogOpen, setDialogOpen] = useState(false);
        const [selectedRole, setSelectedRole] = useState<Role | undefined>();

        const onRoleClicked = useCallback((user: Role) => {
            setDialogOpen(true);
            setSelectedRole(user);
        }, []);

        const handleClose = () => {
            setSelectedRole(undefined);
            setDialogOpen(false);
        };

        return (
            <Container className="w-full flex flex-col py-4 gap-4" maxWidth={"6xl"}>

                {children}

                <div className="flex items-center mt-12">
                    <Typography gutterBottom variant="h4"
                                className="flex-grow"
                                component="h4">
                        Roles
                    </Typography>
                    <Button
                        size={"large"}
                        startIcon={<AddIcon/>}
                        onClick={() => setDialogOpen(true)}>
                        Add role
                    </Button>
                </div>

                <RolesTable onRoleClicked={onRoleClicked} editable={true}/>

                <RolesDetailsForm
                    key={selectedRole?.id ?? "new"}
                    open={dialogOpen}
                    role={selectedRole}
                    editable={true}
                    collections={collections}
                    handleClose={handleClose}/>

            </Container>
        )
    });
