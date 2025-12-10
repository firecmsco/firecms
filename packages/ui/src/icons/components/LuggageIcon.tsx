import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LuggageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"luggage"} ref={ref}/>
});

LuggageIcon.displayName = "LuggageIcon";
