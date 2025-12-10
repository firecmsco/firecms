import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LocalPizzaIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"local_pizza"} ref={ref}/>
});

LocalPizzaIcon.displayName = "LocalPizzaIcon";
