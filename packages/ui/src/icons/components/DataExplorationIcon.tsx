import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DataExplorationIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"data_exploration"} ref={ref}/>
});

DataExplorationIcon.displayName = "DataExplorationIcon";
