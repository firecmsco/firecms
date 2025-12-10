import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PermPhoneMsgIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"perm_phone_msg"} ref={ref}/>
});

PermPhoneMsgIcon.displayName = "PermPhoneMsgIcon";
