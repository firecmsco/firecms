import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RoundedCornerIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rounded_corner"} ref={ref}/>
});

RoundedCornerIcon.displayName = "RoundedCornerIcon";
