import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NatureIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"nature"} ref={ref}/>
});

NatureIcon.displayName = "NatureIcon";
