import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SentimentDissatisfiedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sentiment_dissatisfied"} ref={ref}/>
});

SentimentDissatisfiedIcon.displayName = "SentimentDissatisfiedIcon";
