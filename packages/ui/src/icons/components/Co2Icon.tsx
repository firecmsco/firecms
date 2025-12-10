import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Co2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"co2"} ref={ref}/>
});

Co2Icon.displayName = "Co2Icon";
