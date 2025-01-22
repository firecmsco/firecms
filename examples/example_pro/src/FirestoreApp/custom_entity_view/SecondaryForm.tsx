import { EntityCustomViewParams, PropertyFieldBinding } from "@firecms/core";
import { Container } from "@firecms/ui";

export function SecondaryForm({
                                  formContext
                              }: EntityCustomViewParams) {

    return (
        <>
            <PropertyFieldBinding context={formContext}
                                  propertyKey={"myTestMap"}
                                  property={{
                                      dataType: "map",
                                      name: "My test map",
                                      properties: {
                                          name: {
                                              name: "Name",
                                              dataType: "string",
                                              validation: { required: true }
                                          },
                                          age: {
                                              name: "Age",
                                              dataType: "number",
                                          }
                                      }
                                  }}/>
        </>
    );
}
