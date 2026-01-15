import React from "react";
import { Icon, IconProps } from "../Icon";
/**
 * @group Icons
 */
export const AirlineSeatIndividualSuiteIcon = React.forwardRef<HTMLSpanElement, IconProps>((props, ref) => {
    return <Icon {...props} iconKey={"airline_seat_individual_suite"} ref={ref}/>
});

AirlineSeatIndividualSuiteIcon.displayName = "AirlineSeatIndividualSuiteIcon";
