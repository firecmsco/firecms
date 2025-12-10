import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoneAllIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"done_all"} ref={ref}/>
});

DoneAllIcon.displayName = "DoneAllIcon";
