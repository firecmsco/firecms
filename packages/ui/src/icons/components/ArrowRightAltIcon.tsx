import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowRightAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_right_alt"} ref={ref}/>
});

ArrowRightAltIcon.displayName = "ArrowRightAltIcon";
