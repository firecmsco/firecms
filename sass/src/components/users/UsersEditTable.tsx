import {
    ColorChip,
    FireCMSContext,
    Table,
    TableColumn, useFireCMSContext
} from "@camberi/firecms";
import { SassUser } from "../../models/sass_user";
import { Role } from "../../models/roles";
import { getUserRoles } from "../../util/permissions";
import { Box } from "@mui/material";

import format from "date-fns/format";
import * as locales from "date-fns/locale";
import { defaultDateFormat } from "../../../../lib/src/core/util/dates";

export function UsersEditTable({ users, roles, onUserClicked }: {
    users: SassUser[],
    roles: Role[],
    onUserClicked: (user: SassUser) => void;
}) {

    const appConfig: FireCMSContext<any> | undefined = useFireCMSContext();
    const dateUtilsLocale = appConfig?.locale ? locales[appConfig?.locale] : undefined;
    const dateFormat: string = appConfig?.dateTimeFormat ?? defaultDateFormat;

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
        width: 220,
        title: "Name",
        headerAlign: "left",
        cellRenderer: ({ cellData }) => <Box sx={{ fontWeight: 500 }}>{cellData}</Box>,
    }, {
        key: "roles",
        width: 220,
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
    }, {
        key: "created_on",
        width: 200,
        title: "Created on",
        headerAlign: "left",
        cellRenderer: ({ cellData }) => {
            const formattedDate = cellData ? format(cellData, dateFormat, { locale: dateUtilsLocale }) : "";
            return <>{formattedDate}</>;
        },
    }];

    return <Table
        data={users}
        onRowClick={onRowClick}
        columns={columns}/>
}
