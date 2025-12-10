import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RemoveRoadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"remove_road"} ref={ref}/>
});

RemoveRoadIcon.displayName = "RemoveRoadIcon";
