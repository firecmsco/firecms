import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StorageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"storage"} ref={ref}/>
});

StorageIcon.displayName = "StorageIcon";
