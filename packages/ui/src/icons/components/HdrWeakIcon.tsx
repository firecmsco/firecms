import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HdrWeakIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hdr_weak"} ref={ref}/>
});

HdrWeakIcon.displayName = "HdrWeakIcon";
