import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SourceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"source"} ref={ref}/>
});

SourceIcon.displayName = "SourceIcon";
