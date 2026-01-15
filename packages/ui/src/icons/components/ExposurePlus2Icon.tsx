import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ExposurePlus2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"exposure_plus_2"} ref={ref}/>
});

ExposurePlus2Icon.displayName = "ExposurePlus2Icon";
