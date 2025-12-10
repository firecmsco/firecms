import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MpIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"mp"} ref={ref}/>
});

MpIcon.displayName = "MpIcon";
