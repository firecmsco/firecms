import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LiquorIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"liquor"} ref={ref}/>
});

LiquorIcon.displayName = "LiquorIcon";
