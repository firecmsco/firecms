import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RecyclingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"recycling"} ref={ref}/>
});

RecyclingIcon.displayName = "RecyclingIcon";
