import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SquareIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"square"} ref={ref}/>
});

SquareIcon.displayName = "SquareIcon";
