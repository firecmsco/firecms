import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SquareFootIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"square_foot"} ref={ref}/>
});

SquareFootIcon.displayName = "SquareFootIcon";
