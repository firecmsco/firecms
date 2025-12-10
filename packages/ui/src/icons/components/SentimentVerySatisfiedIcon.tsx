import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SentimentVerySatisfiedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sentiment_very_satisfied"} ref={ref}/>
});

SentimentVerySatisfiedIcon.displayName = "SentimentVerySatisfiedIcon";
