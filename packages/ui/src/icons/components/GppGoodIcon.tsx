import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GppGoodIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gpp_good"} ref={ref}/>
});

GppGoodIcon.displayName = "GppGoodIcon";
