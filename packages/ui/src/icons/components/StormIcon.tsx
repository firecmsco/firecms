import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StormIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"storm"} ref={ref}/>
});

StormIcon.displayName = "StormIcon";
