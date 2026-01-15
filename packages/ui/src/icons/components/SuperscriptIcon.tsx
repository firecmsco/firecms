import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SuperscriptIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"superscript"} ref={ref}/>
});

SuperscriptIcon.displayName = "SuperscriptIcon";
