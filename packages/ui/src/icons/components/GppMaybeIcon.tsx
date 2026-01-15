import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const GppMaybeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"gpp_maybe"} ref={ref}/>
});

GppMaybeIcon.displayName = "GppMaybeIcon";
