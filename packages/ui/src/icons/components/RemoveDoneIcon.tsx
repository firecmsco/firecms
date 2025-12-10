import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RemoveDoneIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"remove_done"} ref={ref}/>
});

RemoveDoneIcon.displayName = "RemoveDoneIcon";
