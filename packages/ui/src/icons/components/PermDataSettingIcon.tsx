import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PermDataSettingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"perm_data_setting"} ref={ref}/>
});

PermDataSettingIcon.displayName = "PermDataSettingIcon";
