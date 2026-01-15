import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SetMealIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"set_meal"} ref={ref}/>
});

SetMealIcon.displayName = "SetMealIcon";
