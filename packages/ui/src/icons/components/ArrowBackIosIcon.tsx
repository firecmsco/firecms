import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowBackIosIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_back_ios"} ref={ref}/>
});

ArrowBackIosIcon.displayName = "ArrowBackIosIcon";
