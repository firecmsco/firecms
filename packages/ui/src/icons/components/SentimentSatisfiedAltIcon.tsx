import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SentimentSatisfiedAltIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sentiment_satisfied_alt"} ref={ref}/>
});

SentimentSatisfiedAltIcon.displayName = "SentimentSatisfiedAltIcon";
