import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const StoreMallDirectoryIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"store_mall_directory"} ref={ref}/>
});

StoreMallDirectoryIcon.displayName = "StoreMallDirectoryIcon";
