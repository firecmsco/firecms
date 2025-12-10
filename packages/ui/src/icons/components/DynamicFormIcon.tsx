import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DynamicFormIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dynamic_form"} ref={ref}/>
});

DynamicFormIcon.displayName = "DynamicFormIcon";
