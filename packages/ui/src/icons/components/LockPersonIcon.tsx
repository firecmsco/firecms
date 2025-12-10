import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LockPersonIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"lock_person"} ref={ref}/>
});

LockPersonIcon.displayName = "LockPersonIcon";
