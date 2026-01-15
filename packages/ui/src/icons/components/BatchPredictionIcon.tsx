import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const BatchPredictionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"batch_prediction"} ref={ref}/>
});

BatchPredictionIcon.displayName = "BatchPredictionIcon";
