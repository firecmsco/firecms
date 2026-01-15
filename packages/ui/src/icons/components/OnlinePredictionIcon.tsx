import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const OnlinePredictionIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"online_prediction"} ref={ref}/>
});

OnlinePredictionIcon.displayName = "OnlinePredictionIcon";
