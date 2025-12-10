import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NoLuggageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"no_luggage"} ref={ref}/>
});

NoLuggageIcon.displayName = "NoLuggageIcon";
