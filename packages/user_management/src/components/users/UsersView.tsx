import { AddIcon, Button, Container, Typography } from "@firecms/ui";

import { UsersTable } from "./UsersTable";
import { UserDetailsForm } from "./UserDetailsForm";
import React, { useCallback, useState } from "react";
import { useUserManagement } from "../../hooks/useUserManagement";
import { User } from "@firecms/core";

export const UsersView = function UsersView({ children }: { children?: React.ReactNode }) {

    const [dialogOpen, setDialogOpen] = useState<boolean>();
    const [selectedUser, setSelectedUser] = useState<User | undefined>();

    const { users } = useUserManagement();

    const onUserClicked = useCallback((user: User) => {
        setSelectedUser(user);
        setDialogOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setDialogOpen(false);
        setSelectedUser(undefined);
    }, []);

    return (
        <Container className="w-full flex flex-col py-4 gap-4" maxWidth={"6xl"}>

            {children}

            <div
                className="flex items-center mt-12">
                <Typography gutterBottom variant="h4"
                            className="flex-grow"
                            component="h4">
                    Users
                </Typography>
                <Button
                    size={"large"}
                    startIcon={<AddIcon/>}
                    onClick={() => setDialogOpen(true)}>
                    Add user
                </Button>
            </div>

            <UsersTable onUserClicked={onUserClicked}/>

            <UserDetailsForm
                key={selectedUser?.uid ?? "new"}
                open={dialogOpen ?? false}
                user={selectedUser}
                handleClose={handleClose}/>

        </Container>
    )
};
