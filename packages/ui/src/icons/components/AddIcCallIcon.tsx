import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddIcCallIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_ic_call"} ref={ref}/>
});

AddIcCallIcon.displayName = "AddIcCallIcon";
