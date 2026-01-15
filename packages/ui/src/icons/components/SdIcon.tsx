import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SdIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sd"} ref={ref}/>
});

SdIcon.displayName = "SdIcon";
