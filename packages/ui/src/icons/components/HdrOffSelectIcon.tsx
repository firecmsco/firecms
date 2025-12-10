import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HdrOffSelectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hdr_off_select"} ref={ref}/>
});

HdrOffSelectIcon.displayName = "HdrOffSelectIcon";
