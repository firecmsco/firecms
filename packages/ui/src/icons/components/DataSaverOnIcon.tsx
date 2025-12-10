import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DataSaverOnIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"data_saver_on"} ref={ref}/>
});

DataSaverOnIcon.displayName = "DataSaverOnIcon";
