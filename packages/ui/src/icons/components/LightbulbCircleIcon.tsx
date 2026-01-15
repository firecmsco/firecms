import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LightbulbCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lightbulb_circle"} ref={ref}/>
});

LightbulbCircleIcon.displayName = "LightbulbCircleIcon";
