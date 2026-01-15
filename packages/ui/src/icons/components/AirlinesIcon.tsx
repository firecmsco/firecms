import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirlinesIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airlines"} ref={ref}/>
});

AirlinesIcon.displayName = "AirlinesIcon";
