import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PasteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"paste"} ref={ref}/>
});

PasteIcon.displayName = "PasteIcon";
