import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PatternIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"pattern"} ref={ref}/>
});

PatternIcon.displayName = "PatternIcon";
