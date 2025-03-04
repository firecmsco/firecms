import {
  buildProperty
} from "@firecms/core";
import {ChatbotExperiment, CustomProperty} from "./models";

export const chatbotCollectionProperties = {
  name: buildProperty({
    name: "Name",
    validation: {required: true},
    dataType: "string"
  }),
  description: buildProperty({
    name: "Description",
    validation: {required: false},
    dataType: "string"
  }),
  tags: buildProperty({
    name: "Tags",
    expanded: false,
    validation: {required: false},
    dataType: "array",
    previewAsTag: true,
    of: {
      dataType: "string"
    }
  }),
  conversationCompleted: buildProperty({
    name: "Conversation Completed",
    defaultValue: "The chat is completed when the assistant or the customer said goodbye. The chat is also considered completed if the assistant says to the customer that it will be contacted shortly",
    longDescription: "Description of when a chat is completed. This will be added to the AI model and will figure out when a chat is done.",
    validation: {required: false},
    dataType: "string",
    multiline: true,
    longText: true,
    longTextRows: 3,
    hideFromCollection: true
  }),
  customProperties: buildProperty({
    name: "Custom Variables",
    validation: {required: false},
    expanded: false,
    dataType: "array",
    of: buildProperty<CustomProperty>({
      name: "Custom Property",
      dataType: "map",
      previewProperties: ["name", "type"],
      properties: {
        name: buildProperty({
          name: "Name",
          validation: {required: true},
          dataType: "string"
        }),
        type: buildProperty({
          name: "Type",
          validation: {required: true},
          dataType: "string",
          enumValues: {
            string: "String",
            number: "Number",
            boolean: "Boolean",
            date: "Date"
          }
        }),
        description: buildProperty({
          name: "Description",
          validation: {required: false},
          dataType: "string"
        })
      }
    })
  }),
  createdAt: buildProperty({
    name: "Created At",
    validation: {required: false},
    dataType: "date",
    readOnly: true,
    autoValue: "on_create"
  }),
  updatedAt: buildProperty({
    name: "Updated At",
    validation: {required: false},
    autoValue: "on_update",
    dataType: "date",
    readOnly: true,
    editable: false,
    hideFromCollection: true
  }),
  updatedBy: buildProperty({
    name: "Updated By",
    validation: {required: false},
    dataType: "map",
    expanded: false,
    previewProperties: ["displayName"],
    properties: {
      uid: buildProperty({
        name: "UID",
        validation: {required: false},
        dataType: "string"
      }),
      displayName: buildProperty({
        name: "Display Name",
        validation: {required: false},
        dataType: "string"
      }),
      email: buildProperty({
        name: "Email",
        validation: {required: false},
        dataType: "string"
      })
    },
    readOnly: true,
    editable: false,
    hideFromCollection: true
  }),
  salesforceId: buildProperty({
    name: "Salesforce ID",
    validation: {required: true},
    dataType: "string",
    hideFromCollection: true
  }),
  apiKey: buildProperty({
    name: "API Key",
    validation: {required: false},
    unique: true,
    dataType: "string",
    readOnly: true,
    editable: false,
    hideFromCollection: true
  }),
  status: buildProperty({
    name: "Chatbot status",
    validation: {required: true},
    dataType: "string",
    enumValues: {
      live: "Live",
      disabled: "Disabled"
    },
    defaultValue: "live"
  }),
  experiments: buildProperty<ChatbotExperiment[]>({
    name: "Experiments",
    expanded: false,
    validation: {required: false},
    dataType: "array",
    of: {
      dataType: "map",
      previewProperties: ["experiment", "completed"],
      properties: {
        completed: buildProperty({
          name: "Completed",
          validation: {required: true},
          dataType: "boolean"
        }),
        experiment: buildProperty({
          name: "Experiment",
          readOnly: true,
          validation: {required: true},
          dataType: "reference",
          previewProperties: ["key", "name", "description"],
          path: "experiments"
        }),
        startedAt: buildProperty({
          name: "Started At",
          readOnly: true,
          validation: {required: false},
          dataType: "date"
        }),
        endedAt: buildProperty({
          name: "Ended At",
          readOnly: true,
          validation: {required: false},
          dataType: "date"
        })
      }
    }
  })
};
