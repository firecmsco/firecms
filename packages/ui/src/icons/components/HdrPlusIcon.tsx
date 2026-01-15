import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HdrPlusIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hdr_plus"} ref={ref}/>
});

HdrPlusIcon.displayName = "HdrPlusIcon";
