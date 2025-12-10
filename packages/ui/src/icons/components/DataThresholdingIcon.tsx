import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DataThresholdingIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"data_thresholding"} ref={ref}/>
});

DataThresholdingIcon.displayName = "DataThresholdingIcon";
