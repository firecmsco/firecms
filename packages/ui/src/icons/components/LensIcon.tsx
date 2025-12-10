import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LensIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lens"} ref={ref}/>
});

LensIcon.displayName = "LensIcon";
