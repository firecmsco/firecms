import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StartIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"start"} ref={ref}/>
});

StartIcon.displayName = "StartIcon";
