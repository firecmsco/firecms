import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const SentimentNeutralIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"sentiment_neutral"} ref={ref}/>
});

SentimentNeutralIcon.displayName = "SentimentNeutralIcon";
