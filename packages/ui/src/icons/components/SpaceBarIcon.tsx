import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SpaceBarIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"space_bar"} ref={ref}/>
});

SpaceBarIcon.displayName = "SpaceBarIcon";
