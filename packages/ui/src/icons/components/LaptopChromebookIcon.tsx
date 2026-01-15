import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const LaptopChromebookIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"laptop_chromebook"} ref={ref}/>
});

LaptopChromebookIcon.displayName = "LaptopChromebookIcon";
