import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SwitchAccountIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"switch_account"} ref={ref}/>
});

SwitchAccountIcon.displayName = "SwitchAccountIcon";
