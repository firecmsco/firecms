import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HdrAutoSelectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hdr_auto_select"} ref={ref}/>
});

HdrAutoSelectIcon.displayName = "HdrAutoSelectIcon";
