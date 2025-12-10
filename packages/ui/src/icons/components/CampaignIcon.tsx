import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const CampaignIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"campaign"} ref={ref}/>
});

CampaignIcon.displayName = "CampaignIcon";
