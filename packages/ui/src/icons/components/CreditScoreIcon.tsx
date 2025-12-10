import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CreditScoreIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"credit_score"} ref={ref}/>
});

CreditScoreIcon.displayName = "CreditScoreIcon";
