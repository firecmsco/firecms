import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const HolidayVillageIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"holiday_village"} ref={ref}/>
});

HolidayVillageIcon.displayName = "HolidayVillageIcon";
