import {
  buildCollection
} from "@firecms/core";

import { chatbotCollectionProperties } from "./chatbots_properties";
import {ChatbotWithNoPrompt} from "./models";
import { ChatbotPromptView } from "./chatbot_prompt_view";


export const chatbotsCollection = buildCollection<ChatbotWithNoPrompt>({
  name: "Chatbots",
  singularName: "Chatbot",
  textSearchEnabled: true,
  path: "chatbots",
  id: "chatbots",
  icon: "chat",
  exportable: false,
  entityViews: [
    {
      key: "prompt_editor",
      name: "Prompt Editor",
      includeActions: true,
      Builder: ChatbotPromptView
    }
  ],
  editable: true,
  hideIdFromForm: true,
  openEntityMode: "side_panel",
  hideIdFromCollection: true,
  subcollections: [],
  group: "Main",
  permissions: {
    read: true,
    edit: true,
    create: true,
    delete: true
  },
  properties: chatbotCollectionProperties
});
