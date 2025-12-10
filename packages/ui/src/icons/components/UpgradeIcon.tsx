import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UpgradeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"upgrade"} ref={ref}/>
});

UpgradeIcon.displayName = "UpgradeIcon";
