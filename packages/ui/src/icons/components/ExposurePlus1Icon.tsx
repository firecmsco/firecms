import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExposurePlus1Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"exposure_plus_1"} ref={ref}/>
});

ExposurePlus1Icon.displayName = "ExposurePlus1Icon";
