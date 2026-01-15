import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const EditOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"edit_off"} ref={ref}/>
});

EditOffIcon.displayName = "EditOffIcon";
