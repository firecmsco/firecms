import { EntityCustomViewParams, FormEntry, FormLayout, PropertyFieldBinding } from "@firecms/core";
import React from "react";
import { Typography } from "@firecms/ui";

export function ProductsSecondaryForm({
                                          formContext
                                      }: EntityCustomViewParams) {

    return (
        <div className={"flex flex-col gap-y-2"}>

            <Typography variant={"h5"}>Secondary form</Typography>

            <Typography variant={"body2"}>This is a demo of a secondary form defined in code</Typography>

            <FormLayout className={"my-4"}>

                <FormEntry propertyKey={"name"}>
                    <PropertyFieldBinding context={formContext}
                                          propertyKey={"name"}
                                          property={{
                                              dataType: "string",
                                              name: "Name",
                                          }}/>
                </FormEntry>

                <FormEntry propertyKey={"tags"} widthPercentage={100}>
                    <PropertyFieldBinding context={formContext}
                                          propertyKey={"tags"}
                                          property={{
                                              dataType: "array",
                                              name: "Tags",
                                              of: {
                                                  dataType: "string"
                                              }
                                          }}/>
                </FormEntry>

                <FormEntry propertyKey={"name"} widthPercentage={100}>
                    <PropertyFieldBinding context={formContext}
                                          propertyKey={"added_on"}
                                          property={{
                                              dataType: "date",
                                              name: "Added on",
                                              autoValue: "on_create"
                                          }}/>
                </FormEntry>
            </FormLayout>
        </div>
    );
}
