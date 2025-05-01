// Class representations of chat message data used in the chat UI
// and the backend

import { z } from 'zod';

// ==== Chat Message Representation in VIEW ====
export enum ChatMessageType {
  AI,
  User,
  AiSuggestion,
}

export class ChatMessageData {
  messageType: ChatMessageType;
  content: string;
  constructor(messageType: ChatMessageType, content: string) {
    this.messageType = messageType;
    this.content = content;
  }
}

export class ChatMessageSuggestionsData extends ChatMessageData {
  suggestions: string[];
  constructor(content: string) {
    super(ChatMessageType.AiSuggestion, content);
    this.suggestions = content.split('|');
  }
}

// ==== Chat Message Representation over Network / API ====

export const chatMessageSchema = z.object({
  messageType: z.nativeEnum(ChatMessageType),
  content: z.string(),
});

export const chatMessageRequestSchema = z.object({
  messages: z.array(chatMessageSchema),
});

export const askPdfChatResponseSchema = z.object({
  messages: z.array(chatMessageSchema),
});



export const getSuggestionsRequestSchema = z.object({
  // The ai response to generate suggestions on 
  aiResponse: z.string(),
});

export const getSuggestionsResponseSchema = z.object({
  suggestions: z.array(z.string()),
});



