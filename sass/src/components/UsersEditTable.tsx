import { ColorChip, Table, TableColumn } from "@camberi/firecms";
import { SassUser } from "../models/sass_user";
import { Role } from "../models/roles";
import { getUserRoles } from "../util/permissions";
import { Box } from "@mui/material";


export function UsersEditTable({ users, roles, onUserClicked }: {
    users: SassUser[],
    roles: Role[],
    onUserClicked: (user: SassUser) => void;
}) {

    const onRowClick = (props: { rowData: SassUser; rowIndex: number; rowKey: string; event: React.SyntheticEvent }) => {
        const user = props.rowData;
        onUserClicked(user);
    }

    const columns: TableColumn<any>[] = [{
        key: "id",
        width: 200,
        cellRenderer: ({ cellData }) => <>{cellData}</>,
    }, {
        key: "email",
        width: 250,
        title: "Email",
        headerAlign: "left",
        cellRenderer: ({ cellData }) => <>{cellData}</>,
    }, {
        key: "name",
        width: 250,
        title: "Name",
        headerAlign: "left",
        cellRenderer: ({ cellData }) => <>{cellData}</>,
    }, {
        key: "roles",
        width: 200,
        title: "Roles",
        headerAlign: "left",
        cellRenderer: ({ cellData, rowData }) => {
            const user = rowData;
            const userRoleIds: string[] | undefined = cellData;
            if (!userRoleIds) return null;
            const userRoles = getUserRoles(roles, user)
            return userRoles ? <Box sx={theme => ({
                display: "flex",
                flexWrap: "wrap",
                gap: theme.spacing(0.5)
            })}>
                {userRoles.map(userRole => <ColorChip label={userRole.name}/>)}
            </Box> : null;
        },
    }];

    return <Table
        data={users}
        onRowClick={onRowClick}
        columns={columns}/>
}
