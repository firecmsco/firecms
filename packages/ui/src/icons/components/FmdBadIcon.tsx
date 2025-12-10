import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const FmdBadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"fmd_bad"} ref={ref}/>
});

FmdBadIcon.displayName = "FmdBadIcon";
