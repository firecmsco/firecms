import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TableRowsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"table_rows"} ref={ref}/>
});

TableRowsIcon.displayName = "TableRowsIcon";
