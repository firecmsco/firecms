import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HdrOnSelectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"hdr_on_select"} ref={ref}/>
});

HdrOnSelectIcon.displayName = "HdrOnSelectIcon";
