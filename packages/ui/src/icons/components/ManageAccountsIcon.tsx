import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ManageAccountsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"manage_accounts"} ref={ref}/>
});

ManageAccountsIcon.displayName = "ManageAccountsIcon";
