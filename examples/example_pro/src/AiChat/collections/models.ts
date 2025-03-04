import {User} from "@firecms/core";
import {DocumentReference} from "firebase/firestore";

export type Assistant = {
  name: string;
  avatar: string;
}

export type CustomProperty = {
  name: string;
  type: "boolean"|"string"|"number"|"date";
  description: string;
}

export type CustomizationColorPalette = {
  background: string;
  foreground: string;
  avatar_background: string;
  close_background: string;
  close_foreground: string;
  badge_background: string;
  badge_foreground: string;
}

export type Customization = {
  popup_style: "bubble" | "sidepanel";
  button_style: "button" | "box";
  color_palette: CustomizationColorPalette,
  main_color: string;
  company_logo: string;
  chat_logo: string;
  chat_logo_size: number;
  chat_logo_text: string;
  chat_logo_overtext?: string;
  notification_bubble_color: string;
  chat_autostart: boolean;
  chat_autostart_time: number;
  mobile_chat_autostart: boolean;
  mobile_chat_autostart_time: number
  position: string;
  lateral_distance: number;
  bottom_distance: number;
  custom_font_name: string;
  custom_regular_font_woff: string;
  custom_regular_font_woff2: string;
  custom_bold_font_woff: string;
  custom_bold_font_woff2: string;
}

export enum LLMProvider {
  OPENAI = "openai",
  GOOGLE = "google"
}

export enum LLMModel {
  // Google models
  GEMINI_2_FLASH = "gemini-2.0-flash",
  GEMINI_2_PRO_EXP = "gemini-2.0-pro-exp-02-05",
  // OpenAI models
  GPT4_TURBO = "gpt-4-turbo",
  GPT_4O = "gpt-4o",
  O3_MINI = "o3-mini"
}

export type LLMConfig = {
  provider: LLMProvider;
  model: LLMModel;
}

export type ChatbotLLMConfig = {
  conversation: LLMConfig;
  data: LLMConfig;
}

export type Chatbot = {
  name: string;
  description: string;
  status: "live" | "disabled";
  prompt: string
  restrictions: string;
  assistant: Assistant;
  customization: Customization;
  conversationCompleted: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  updatedBy: Partial<User>|null;
  customProperties: CustomProperty[];
  llmConfig: ChatbotLLMConfig;
  salesforceId: string;
  experiments?: ChatbotExperiment[];
  apiKey: string;
}

export type ChatbotExperiment = {
  completed: boolean;
  endedAt: Date;
  experiment: DocumentReference;
  startedAt: Date;
}

export type ChatbotWithNoPrompt = Omit<Chatbot, "prompt" | "restrictions" | "customization" | "assistant" | "llmConfig">;
