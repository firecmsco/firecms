import { Table, TableColumn } from "@camberi/firecms";
import { SassUser } from "../models/sass_user";


export function UsersEditTable({users}: {
    users: SassUser[],
    onUserEdit: (user: SassUser) => Promise<void>;
}) {

    const columns: TableColumn<any>[] = [{
        key: "id",
        width: 200,
        title: "Id",
        headerAlign: "center",
        cellRenderer: ({ cellData }) => <div>{cellData}</div>,
    }];

    return <Table
        data={users}
        columns={columns}/>
}
