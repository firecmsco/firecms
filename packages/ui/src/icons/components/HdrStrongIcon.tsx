import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HdrStrongIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hdr_strong"} ref={ref}/>
});

HdrStrongIcon.displayName = "HdrStrongIcon";
