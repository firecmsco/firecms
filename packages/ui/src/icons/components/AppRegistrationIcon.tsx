import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AppRegistrationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"app_registration"} ref={ref}/>
});

AppRegistrationIcon.displayName = "AppRegistrationIcon";
