import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoDrinksIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"no_drinks"} ref={ref}/>
});

NoDrinksIcon.displayName = "NoDrinksIcon";
