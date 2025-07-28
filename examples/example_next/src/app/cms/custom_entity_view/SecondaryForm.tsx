import { EntityCustomViewParams, PropertyFieldBinding } from "@firecms/core";
import { Container } from "@firecms/ui";

export function SecondaryForm({
                                  formContext
                              }: EntityCustomViewParams) {

    return (
        <Container className={"my-16"}>
            <PropertyFieldBinding context={formContext}
                                  propertyKey={"myTestMap"}
                                  property={{
                                      type: "map",
                                      name: "My test map",
                                      properties: {
                                          name: {
                                              name: "Name",
                                              type: "string",
                                              validation: { required: true }
                                          },
                                          age: {
                                              name: "Age",
                                              type: "number",
                                          }
                                      }
                                  }}/>
        </Container>
    );
}
