import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SnapchatIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"snapchat"} ref={ref}/>
});

SnapchatIcon.displayName = "SnapchatIcon";
