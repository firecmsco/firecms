import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DatasetIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dataset"} ref={ref}/>
});

DatasetIcon.displayName = "DatasetIcon";
