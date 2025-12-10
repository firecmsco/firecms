import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TableViewIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"table_view"} ref={ref}/>
});

TableViewIcon.displayName = "TableViewIcon";
