import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RememberMeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"remember_me"} ref={ref}/>
});

RememberMeIcon.displayName = "RememberMeIcon";
