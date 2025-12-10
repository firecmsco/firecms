import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PermContactCalIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"perm_contact_cal"} ref={ref}/>
});

PermContactCalIcon.displayName = "PermContactCalIcon";
