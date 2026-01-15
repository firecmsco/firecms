import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoneOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"done_outline"} ref={ref}/>
});

DoneOutlineIcon.displayName = "DoneOutlineIcon";
