import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PermIdentityIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"perm_identity"} ref={ref}/>
});

PermIdentityIcon.displayName = "PermIdentityIcon";
