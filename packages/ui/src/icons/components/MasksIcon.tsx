import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MasksIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"masks"} ref={ref}/>
});

MasksIcon.displayName = "MasksIcon";
