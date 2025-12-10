import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LightbulbOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lightbulb_outline"} ref={ref}/>
});

LightbulbOutlineIcon.displayName = "LightbulbOutlineIcon";
