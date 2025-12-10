import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AddBusinessIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"add_business"} ref={ref}/>
});

AddBusinessIcon.displayName = "AddBusinessIcon";
