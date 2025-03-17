export interface ConversationEntry {
  speaker: string;
  text: string;
}

export type ConversationHistory = ConversationEntry[]; 