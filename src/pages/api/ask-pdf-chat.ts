// Service class for making requests to

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { z } from 'zod';

import { logger } from '@/lib/default-logger';
import {
  askPdfChatResponseSchema,
  ChatMessageData,
  chatMessageRequestSchema,
  ChatMessageType,
} from '@/lib/pdf-chat/chat-message-data';

const TAG = 'ask-pdf-chat';

const API_KEY = ''; // TODO:  move sensitive data like API keys to environment variables

const generateResponse = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  if (req.method === 'POST') {
    logger.debug(TAG, 'Received request');
    try {
      const parsedChatMessageRequest = chatMessageRequestSchema.parse(req.body);
      const messages: ChatMessageData[] = parsedChatMessageRequest.messages;

      logger.debug(TAG, 'messages received:', messages);

      // Convert ChatMessages to AskChatPDF external api's expected format
      const chatPdfMessages: AskChatPdfMessageModel[] = messages.map((message) =>
        chatMessageToAskChatPdfMessage(message)
      );

      const result = await askPdfChatService(chatPdfMessages);

      const response = askPdfChatResponseSchema.parse({
        messages: [new ChatMessageData(ChatMessageType.AI, result)],
      });

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error processing request:', error);
      res.status(400).json({ error: 'Invalid request body', details: error });
    }
  } else {
    res.status(405).end(); // Method Not Allowed
  }
};

export default generateResponse;

// === Integration code for AskChatPdf external api ===

enum AskChatPdfMessageRole {
  User = 'user',
  Assistant = 'assistant',
}

class AskChatPdfMessageModel {
  role: AskChatPdfMessageRole;
  content: string;
  constructor(role: AskChatPdfMessageRole, content: string) {
    this.role = role;
    this.content = content;
  }
}

export const askChatPdfMessageSchema = z.object({
  role: z.nativeEnum(AskChatPdfMessageRole),
  content: z.string(),
});

const askChatPdfRequestSchema = z.object({
  referenceSources: z.boolean(),
  sourceId: z.string(),
  messages: z.array(
    z.object({
      role: z.string(),
      content: z.string(),
    })
  ),
});

const askChatPdfResponseSchema = z.object({
  content: z.string(),
});

/*
function askChatPdfMessageToChatMessage(askChatPdfMessage: AskChatPdfMessageModel): ChatMessageData {
  return new ChatMessageData(askChatPdfMessage.role === AskChatPdfMessageRole.User ? ChatMessageType.User : ChatMessageType.AI, askChatPdfMessage.content);
}
*/

function chatMessageToAskChatPdfMessage(chatMessage: ChatMessageData): AskChatPdfMessageModel {
  // Convert the messageType to the correct enum value
  const role =
    chatMessage.messageType === ChatMessageType.User ? AskChatPdfMessageRole.User : AskChatPdfMessageRole.Assistant;

  return new AskChatPdfMessageModel(role, chatMessage.content);
}

const askPdfChatService = async (messages: AskChatPdfMessageModel[]): Promise<string> => {
  const config = {
    headers: {
      'x-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
  };

  const data = askChatPdfRequestSchema.parse({
    referenceSources: true,

    // For NazionaleWork IT sourceId: 'cha_m7bSdy513jJcv6LmFP2dR',

    // For Decree2008 ITL sourceId:
    sourceId: '',
    messages: messages.map((message) => ({
      role: message.role.toString(),
      content: message.content,
    })),
  });

  try {
    const response = await axios.post('https://api.chatpdf.com/v1/chats/message', data, config);

    const parsedResponse = askChatPdfResponseSchema.parse(response.data);
    logger.debug('Result:', parsedResponse.content);
    return parsedResponse.content;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error('Axios error:', error.message);
      if (error.response) {
        logger.error('Response data:', error.response.data);
        logger.error('Response status:', error.response.status);
        logger.error('Response headers:', error.response.headers);
      }
    } else {
      logger.error('Unexpected error:', error);
    }
    throw new Error('Failed to communicate with PDF chat service');
  }
};
