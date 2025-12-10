import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AccountTreeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"account_tree"} ref={ref}/>
});

AccountTreeIcon.displayName = "AccountTreeIcon";
