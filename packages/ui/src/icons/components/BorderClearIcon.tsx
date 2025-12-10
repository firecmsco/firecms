import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BorderClearIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"border_clear"} ref={ref}/>
});

BorderClearIcon.displayName = "BorderClearIcon";
