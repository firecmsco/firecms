import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StraightenIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"straighten"} ref={ref}/>
});

StraightenIcon.displayName = "StraightenIcon";
