import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SelectAllIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"select_all"} ref={ref}/>
});

SelectAllIcon.displayName = "SelectAllIcon";
