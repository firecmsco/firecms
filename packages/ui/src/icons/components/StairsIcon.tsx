import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StairsIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"stairs"} ref={ref}/>
});

StairsIcon.displayName = "StairsIcon";
