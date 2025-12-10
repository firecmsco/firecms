import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ListAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"list_alt"} ref={ref}/>
});

ListAltIcon.displayName = "ListAltIcon";
