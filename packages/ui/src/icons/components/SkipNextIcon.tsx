import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SkipNextIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"skip_next"} ref={ref}/>
});

SkipNextIcon.displayName = "SkipNextIcon";
