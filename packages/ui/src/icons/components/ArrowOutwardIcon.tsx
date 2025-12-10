import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowOutwardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_outward"} ref={ref}/>
});

ArrowOutwardIcon.displayName = "ArrowOutwardIcon";
