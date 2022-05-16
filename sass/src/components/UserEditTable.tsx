import { Table, TableColumn, TableSize } from "@camberi/firecms";
import { SassUser } from "../models/sass_user";


export function UserEditTable({users}: {
    users: SassUser[],
    onUserEdit: (user: SassUser) => Promise<void>;
}) {

    const columns: TableColumn<any>[] = [];

    return <Table
        data={users}
        columns={columns}
        idColumnBuilder={(props: {
            entry: SassUser,
            size: TableSize,
        }) => null}/>
}
