import { Box, Button, Container, Paper, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

import { RolesTable } from "./RolesTable";
import { useConfigController } from "../../useConfigController";
import { RolesDetailsForm } from "./RolesDetailsForm";
import { useCallback, useState } from "react";
import { Role } from "../../models/roles";
import { EntityCollection } from "@camberi/firecms";

export function RolesView({
                              collections
                          }: {
    collections?: EntityCollection[]
}) {

    const { roles } = useConfigController();
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
        <Container sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            py: 2
        }}>
            <Box display={"flex"}
                 sx={{
                     display: "flex",
                     alignItems: "center",
                     my: 2
                 }}>
                <Typography gutterBottom variant="h4"
                            sx={{
                                flexGrow: 1
                            }}
                            component="h4">
                    Roles
                </Typography>
                <Button variant={"outlined"}
                        size={"large"}
                        startIcon={<AddIcon/>}
                        onClick={() => setDialogOpen(true)}>
                    Add role
                </Button>
            </Box>

            <RolesTable onRoleClicked={onRoleClicked}/>

            <RolesDetailsForm open={dialogOpen}
                              role={selectedRole}
                              collections={collections}
                              handleClose={handleClose}/>

        </Container>
    )
}
