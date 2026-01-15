import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const RateReviewIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"rate_review"} ref={ref}/>
});

RateReviewIcon.displayName = "RateReviewIcon";
