import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LabelImportantIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"label_important"} ref={ref}/>
});

LabelImportantIcon.displayName = "LabelImportantIcon";
