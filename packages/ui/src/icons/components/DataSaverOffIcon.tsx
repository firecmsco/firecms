import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const DataSaverOffIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"data_saver_off"} ref={ref}/>
});

DataSaverOffIcon.displayName = "DataSaverOffIcon";
