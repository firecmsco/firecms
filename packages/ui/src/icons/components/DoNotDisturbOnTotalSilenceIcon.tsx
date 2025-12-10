import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DoNotDisturbOnTotalSilenceIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"do_not_disturb_on_total_silence"} ref={ref}/>
});

DoNotDisturbOnTotalSilenceIcon.displayName = "DoNotDisturbOnTotalSilenceIcon";
