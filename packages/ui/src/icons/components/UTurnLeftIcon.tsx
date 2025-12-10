import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UTurnLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"u_turn_left"} ref={ref}/>
});

UTurnLeftIcon.displayName = "UTurnLeftIcon";
