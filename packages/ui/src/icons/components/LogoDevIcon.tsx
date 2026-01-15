import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LogoDevIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"logo_dev"} ref={ref}/>
});

LogoDevIcon.displayName = "LogoDevIcon";
