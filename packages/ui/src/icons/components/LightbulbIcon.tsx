import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LightbulbIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lightbulb"} ref={ref}/>
});

LightbulbIcon.displayName = "LightbulbIcon";
