import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EggIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"egg"} ref={ref}/>
});

EggIcon.displayName = "EggIcon";
