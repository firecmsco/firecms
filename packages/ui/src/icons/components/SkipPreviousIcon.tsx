import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SkipPreviousIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"skip_previous"} ref={ref}/>
});

SkipPreviousIcon.displayName = "SkipPreviousIcon";
