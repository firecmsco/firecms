import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SentimentVeryDissatisfiedIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sentiment_very_dissatisfied"} ref={ref}/>
});

SentimentVeryDissatisfiedIcon.displayName = "SentimentVeryDissatisfiedIcon";
