import { EntityCustomViewParams, PropertyFieldBinding } from "@firecms/core";
import { Container } from "@firecms/ui";

export function SecondaryForm({
                                  formContext,
                              }: EntityCustomViewParams) {

    return (
        <Container className={"my-16"}>
            <PropertyFieldBinding context={formContext}
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
                                              validation: { required: true }
                                          }
                                      }
                                  }}
                                  propertyKey={"myTestMap"}/>
        </Container>
    );
}
