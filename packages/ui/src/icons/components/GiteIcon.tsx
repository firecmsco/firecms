import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GiteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gite"} ref={ref}/>
});

GiteIcon.displayName = "GiteIcon";
