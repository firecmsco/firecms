import { AddIcon, Button, Container, Typography } from "@firecms/core";

import { UsersTable } from "./UsersTable";
import { UserDetailsForm } from "./UserDetailsForm";
import React, { useCallback, useState } from "react";
import { SaasUserProject } from "../../types";
import { useProjectConfig } from "../../hooks";
import { SubscriptionPlanWidget } from "../subscriptions";

export const UsersView = function UsersView() {

    const [dialogOpen, setDialogOpen] = useState<boolean>();
    const [selectedUser, setSelectedUser] = useState<SaasUserProject | undefined>();

    const { usersLimit, users } = useProjectConfig();
    const reachedUsersLimit = usersLimit !== null && (users && users.length >= usersLimit);

    const onUserClicked = useCallback((user: SaasUserProject) => {
        setSelectedUser(user);
        setDialogOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setDialogOpen(false);
        setSelectedUser(undefined);
    }, []);

    return (
        <Container className="w-full flex flex-col py-2 gap-4" maxWidth={"6xl"}>

            <SubscriptionPlanWidget
                showForPlans={["free"]}
                message={<>Upgrade to PLUS to remove the <b>{usersLimit} users limit</b></>}/>

            <div
                className="flex items-center mt-12">
                <Typography gutterBottom variant="h4"
                            className="flex-grow"
                            component="h4">
                    Users
                </Typography>
                <Button
                    size={"large"}
                    disabled={reachedUsersLimit}
                    startIcon={<AddIcon/>}
                    onClick={() => setDialogOpen(true)}>
                    Add user
                </Button>
            </div>

            <UsersTable onUserClicked={onUserClicked}/>

            <UserDetailsForm open={dialogOpen ?? false}
                             user={selectedUser}
                             handleClose={handleClose}/>

        </Container>
    )
};
