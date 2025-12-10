import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowBackIosNewIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_back_ios_new"} ref={ref}/>
});

ArrowBackIosNewIcon.displayName = "ArrowBackIosNewIcon";
