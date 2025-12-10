import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ChevronLeftIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"chevron_left"} ref={ref}/>
});

ChevronLeftIcon.displayName = "ChevronLeftIcon";
