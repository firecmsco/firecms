import {
    FireCMSContext,
    Table,
    TableColumn,
    useFireCMSContext
} from "@camberi/firecms";
import { Role } from "../../models/roles";
import { Box } from "@mui/material";
import * as locales from "date-fns/locale";
import { defaultDateFormat } from "../utils/dates";
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

export function RolesTable({ roles, onRoleClicked }: {
    roles: Role[],
    onRoleClicked: (role: Role) => void;
}) {

    const appConfig: FireCMSContext<any> | undefined = useFireCMSContext();
    const dateUtilsLocale = appConfig?.locale ? locales[appConfig?.locale] : undefined;
    const dateFormat: string = appConfig?.dateTimeFormat ?? defaultDateFormat;

    const onRowClick = (props: { rowData: Role; rowIndex: number; rowKey: string; event: React.SyntheticEvent }) => {
        const role = props.rowData;
        onRoleClicked(role);
    }

    const columns: TableColumn<any>[] = [
        {
            key: "name",
            width: 220,
            title: "Role",
            headerAlign: "left",
            cellRenderer: ({ cellData }) => <Box
                sx={{ p: 2 }}>{cellData}</Box>,
        },
        {
            key: "isAdmin",
            width: 220,
            title: "Is Admin",
            headerAlign: "left",
            cellRenderer: ({ cellData }) => (<Box
                sx={{ p: 2 }}>
                {cellData ? <CheckBoxIcon color={"primary"}/> :
                    <CheckBoxOutlineBlankIcon/>}
            </Box>),
        }
    ];

    return <Table
        data={roles}
        onRowClick={onRowClick}
        columns={columns}/>
}
