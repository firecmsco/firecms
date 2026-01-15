import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SanitizerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sanitizer"} ref={ref}/>
});

SanitizerIcon.displayName = "SanitizerIcon";
