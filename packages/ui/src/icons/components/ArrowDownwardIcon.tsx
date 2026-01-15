import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ArrowDownwardIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"arrow_downward"} ref={ref}/>
});

ArrowDownwardIcon.displayName = "ArrowDownwardIcon";
