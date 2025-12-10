import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const IceSkatingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"ice_skating"} ref={ref}/>
});

IceSkatingIcon.displayName = "IceSkatingIcon";
