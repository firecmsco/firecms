import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GppBadIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gpp_bad"} ref={ref}/>
});

GppBadIcon.displayName = "GppBadIcon";
