import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const NewLabelIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"new_label"} ref={ref}/>
});

NewLabelIcon.displayName = "NewLabelIcon";
