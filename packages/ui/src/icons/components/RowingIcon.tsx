import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RowingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rowing"} ref={ref}/>
});

RowingIcon.displayName = "RowingIcon";
