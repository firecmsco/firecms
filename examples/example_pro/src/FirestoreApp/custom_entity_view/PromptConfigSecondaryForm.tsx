import React from "react";
import { PropertyFieldBinding, EntityCustomViewParams } from "@firecms/core";
import { Container } from "@firecms/ui";

export function PromptConfigSecondaryForm({
                                              formContext
                                          }: EntityCustomViewParams) {
    return (
        <Container className={"my-16 flex flex-col gap-4 w-full"}>
            <PropertyFieldBinding context={formContext}
                                  property={{
                                      type: "string",
                                      name: "Prompt",
                                      multiline: true
                                  }}
                                  propertyKey={"prompt"}/>
            <PropertyFieldBinding context={formContext}
                                  property={{
                                      type: "string",
                                      name: "Restrictions",
                                      multiline: true
                                  }}
                                  propertyKey={"restrictions"}/>
        </Container>
    )
}
