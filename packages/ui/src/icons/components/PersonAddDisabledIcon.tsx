import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PersonAddDisabledIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"person_add_disabled"} ref={ref}/>
});

PersonAddDisabledIcon.displayName = "PersonAddDisabledIcon";
