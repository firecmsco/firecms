import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DataObjectIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"data_object"} ref={ref}/>
});

DataObjectIcon.displayName = "DataObjectIcon";
