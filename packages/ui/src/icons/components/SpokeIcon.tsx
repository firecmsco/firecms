import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SpokeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"spoke"} ref={ref}/>
});

SpokeIcon.displayName = "SpokeIcon";
