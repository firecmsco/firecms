import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const Person2Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"person_2"} ref={ref}/>
});

Person2Icon.displayName = "Person2Icon";
