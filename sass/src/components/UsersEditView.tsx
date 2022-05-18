import { Container, Paper, Typography } from "@mui/material";
import { UsersEditTable } from "./UsersEditTable";
import { useConfigController } from "../useConfigController";

export function UsersEditView() {

    const { users, saveUser } = useConfigController();
    return (
        <Container sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            py: 2
        }}>
            <Typography gutterBottom variant="h4"
                        sx={{
                            my: 2
                        }}
                        component="h4">
                Users
            </Typography>
            <Paper variant={"outlined"} sx={{
                flexGrow: 1,
                overflow: "hidden"
            }}>
                <UsersEditTable users={users} onUserEdit={saveUser}/>
            </Paper>
        </Container>
    )
}
