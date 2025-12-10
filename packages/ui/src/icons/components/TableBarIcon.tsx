import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const TableBarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"table_bar"} ref={ref}/>
});

TableBarIcon.displayName = "TableBarIcon";
