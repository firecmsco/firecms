import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StoreIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"store"} ref={ref}/>
});

StoreIcon.displayName = "StoreIcon";
