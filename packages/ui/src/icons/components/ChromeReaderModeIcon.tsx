import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const ChromeReaderModeIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"chrome_reader_mode"} ref={ref}/>
});

ChromeReaderModeIcon.displayName = "ChromeReaderModeIcon";
