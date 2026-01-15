import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LabelImportantOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"label_important_outline"} ref={ref}/>
});

LabelImportantOutlineIcon.displayName = "LabelImportantOutlineIcon";
