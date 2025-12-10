import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SupervisedUserCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"supervised_user_circle"} ref={ref}/>
});

SupervisedUserCircleIcon.displayName = "SupervisedUserCircleIcon";
