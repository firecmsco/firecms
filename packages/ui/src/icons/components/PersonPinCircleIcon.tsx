import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PersonPinCircleIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"person_pin_circle"} ref={ref}/>
});

PersonPinCircleIcon.displayName = "PersonPinCircleIcon";
