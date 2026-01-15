import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EscalatorIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"escalator"} ref={ref}/>
});

EscalatorIcon.displayName = "EscalatorIcon";
