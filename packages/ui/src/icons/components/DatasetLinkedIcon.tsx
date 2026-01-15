import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DatasetLinkedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"dataset_linked"} ref={ref}/>
});

DatasetLinkedIcon.displayName = "DatasetLinkedIcon";
