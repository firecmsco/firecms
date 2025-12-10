import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SentimentSatisfiedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sentiment_satisfied"} ref={ref}/>
});

SentimentSatisfiedIcon.displayName = "SentimentSatisfiedIcon";
