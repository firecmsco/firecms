import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GavelIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gavel"} ref={ref}/>
});

GavelIcon.displayName = "GavelIcon";
