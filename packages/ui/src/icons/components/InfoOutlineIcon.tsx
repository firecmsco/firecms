import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const InfoOutlineIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"info_outline"} ref={ref}/>
});

InfoOutlineIcon.displayName = "InfoOutlineIcon";
