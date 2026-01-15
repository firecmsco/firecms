import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const MoveDownIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"move_down"} ref={ref}/>
});

MoveDownIcon.displayName = "MoveDownIcon";
