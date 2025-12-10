import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const PersonAddAlt1Icon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"person_add_alt_1"} ref={ref}/>
});

PersonAddAlt1Icon.displayName = "PersonAddAlt1Icon";
