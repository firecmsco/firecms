import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InstallMobileIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"install_mobile"} ref={ref}/>
});

InstallMobileIcon.displayName = "InstallMobileIcon";
