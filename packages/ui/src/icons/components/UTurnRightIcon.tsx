import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const UTurnRightIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"u_turn_right"} ref={ref}/>
});

UTurnRightIcon.displayName = "UTurnRightIcon";
